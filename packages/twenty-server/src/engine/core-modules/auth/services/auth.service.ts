import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'node:crypto';

import { render } from '@react-email/components';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordUpdateNotifyEmail } from 'twenty-emails';
import { Repository } from 'typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { AuthorizeApp } from 'src/engine/core-modules/auth/dto/authorize-app.entity';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { ChallengeInput } from 'src/engine/core-modules/auth/dto/challenge.input';
import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { UpdatePassword } from 'src/engine/core-modules/auth/dto/update-password.entity';
import {
  UserExists,
  UserNotExists,
} from 'src/engine/core-modules/auth/dto/user-exists.entity';
import { WorkspaceInviteHashValid } from 'src/engine/core-modules/auth/dto/workspace-invite-hash-valid.entity';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SocialSsoService } from 'src/engine/core-modules/auth/services/social-sso.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  AuthProviderWithPasswordType,
  ExistingUserOrNewUser,
  SignInUpBaseParams,
  SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class AuthService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly socialSsoService: SocialSsoService,
    private readonly userService: UserService,
    private readonly signInUpService: SignInUpService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
  ) {}

  private async checkAccessAndUseInvitationOrThrow(
    workspace: Workspace,
    user: User,
  ) {
    if (
      await this.userWorkspaceService.checkUserWorkspaceExists(
        user.id,
        workspace.id,
      )
    ) {
      return;
    }

    const invitation =
      await this.workspaceInvitationService.getOneWorkspaceInvitation(
        workspace.id,
        user.email,
      );

    if (invitation) {
      await this.workspaceInvitationService.validateInvitation({
        workspacePersonalInviteToken: invitation.value,
        email: user.email,
      });
      await this.userWorkspaceService.addUserToWorkspace(user, workspace);

      return;
    }

    throw new AuthException(
      "You're not member of this workspace.",
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }

  async challenge(challengeInput: ChallengeInput, targetWorkspace: Workspace) {
    if (!targetWorkspace.isPasswordAuthEnabled) {
      throw new AuthException(
        'Email/Password auth is not enabled for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        email: challengeInput.email,
      },
      relations: ['workspaces'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    await this.checkAccessAndUseInvitationOrThrow(targetWorkspace, user);

    if (!user.passwordHash) {
      throw new AuthException(
        'Incorrect login method',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new AuthException(
        'Wrong password',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const isEmailVerificationRequired = this.environmentService.get(
      'IS_EMAIL_VERIFICATION_REQUIRED',
    );

    if (isEmailVerificationRequired && !user.isEmailVerified) {
      throw new AuthException(
        'Email is not verified',
        AuthExceptionCode.EMAIL_NOT_VERIFIED,
      );
    }

    return user;
  }

  async signInUp(
    params: SignInUpBaseParams &
      ExistingUserOrNewUser &
      AuthProviderWithPasswordType,
  ) {
    if (
      params.authParams.provider === 'password' &&
      params.userData.type === 'newUser'
    ) {
      params.userData.newUserPayload.passwordHash =
        await this.signInUpService.generateHash(params.authParams.password);
    }

    if (
      params.authParams.provider === 'password' &&
      params.userData.type === 'existingUser'
    ) {
      await this.signInUpService.validatePassword({
        password: params.authParams.password,
        passwordHash: params.userData.existingUser.passwordHash,
      });
    }

    if (params.workspace) {
      workspaceValidator.isAuthEnabledOrThrow(
        params.authParams.provider,
        params.workspace,
      );
    }

    if (params.userData.type === 'newUser') {
      const partialUserWithPicture =
        await this.signInUpService.computeParamsForNewUser(
          params.userData.newUserPayload,
          params.authParams,
        );

      return await this.signInUpService.signInUp({
        ...params,
        userData: {
          type: 'newUserWithPicture',
          newUserWithPicture: partialUserWithPicture,
        },
      });
    }

    return await this.signInUpService.signInUp({
      ...params,
      userData: {
        type: 'existingUser',
        existingUser: params.userData.existingUser,
      },
    });
  }

  async verify(email: string, workspaceId: string): Promise<AuthTokens> {
    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    // passwordHash is hidden for security reasons
    user.passwordHash = '';

    const accessToken = await this.accessTokenService.generateAccessToken(
      user.id,
      workspaceId,
    );
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      workspaceId,
    );

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async checkUserExists(email: string): Promise<UserExists | UserNotExists> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (userValidator.isDefined(user)) {
      return {
        exists: true,
        availableWorkspaces:
          await this.userWorkspaceService.findAvailableWorkspacesByEmail(email),
        isEmailVerified: user.isEmailVerified,
      };
    }

    return { exists: false };
  }

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValid> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    return { isValid: !!workspace };
  }

  async generateAuthorizationCode(
    authorizeAppInput: AuthorizeAppInput,
    user: User,
    workspace: Workspace,
  ): Promise<AuthorizeApp> {
    // TODO: replace with db call to - third party app table
    const apps = [
      {
        id: 'chrome',
        name: 'Chrome Extension',
        redirectUrl:
          this.environmentService.get('NODE_ENV') ===
          NodeEnvironment.development
            ? authorizeAppInput.redirectUrl
            : `https://${this.environmentService.get(
                'CHROME_EXTENSION_ID',
              )}.chromiumapp.org/`,
      },
    ];

    const { clientId, codeChallenge } = authorizeAppInput;

    const client = apps.find((app) => app.id === clientId);

    if (!client) {
      throw new AuthException(
        `Client not found for '${clientId}'`,
        AuthExceptionCode.CLIENT_NOT_FOUND,
      );
    }

    if (!client.redirectUrl || !authorizeAppInput.redirectUrl) {
      throw new AuthException(
        `redirectUrl not found for '${clientId}'`,
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (client.redirectUrl !== authorizeAppInput.redirectUrl) {
      throw new AuthException(
        `redirectUrl mismatch for '${clientId}'`,
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const authorizationCode = crypto.randomBytes(42).toString('hex');

    const expiresAt = addMilliseconds(new Date().getTime(), ms('5m'));

    if (codeChallenge) {
      const tokens = this.appTokenRepository.create([
        {
          value: codeChallenge,
          type: AppTokenType.CodeChallenge,
          userId: user.id,
          workspaceId: workspace.id,
          expiresAt,
        },
        {
          value: authorizationCode,
          type: AppTokenType.AuthorizationCode,
          userId: user.id,
          workspaceId: workspace.id,
          expiresAt,
        },
      ]);

      await this.appTokenRepository.save(tokens);
    } else {
      const token = this.appTokenRepository.create({
        value: authorizationCode,
        type: AppTokenType.AuthorizationCode,
        userId: user.id,
        workspaceId: workspace.id,
        expiresAt,
      });

      await this.appTokenRepository.save(token);
    }

    const redirectUrl = `${
      client.redirectUrl ? client.redirectUrl : authorizeAppInput.redirectUrl
    }?authorizationCode=${authorizationCode}`;

    return { redirectUrl };
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<UpdatePassword> {
    if (!userId) {
      throw new AuthException(
        'User ID is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    const isPasswordValid = PASSWORD_REGEX.test(newPassword);

    if (!isPasswordValid) {
      throw new AuthException(
        'Password is too weak',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    const emailTemplate = PasswordUpdateNotifyEmail({
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      link: this.domainManagerService.getBaseUrl().toString(),
    });

    const html = render(emailTemplate, {
      pretty: true,
    });
    const text = render(emailTemplate, {
      plainText: true,
    });

    this.emailService.send({
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      to: user.email,
      subject: 'Your Password Has Been Successfully Changed',
      text,
      html,
    });

    return { success: true };
  }

  async findWorkspaceFromInviteHashOrFail(
    inviteHash: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace does not exist',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return workspace;
  }

  computeRedirectURI({
    loginToken,
    subdomain,
    billingCheckoutSessionState,
  }: {
    loginToken: string;
    subdomain?: string;
    billingCheckoutSessionState?: string;
  }) {
    const url = this.domainManagerService.buildWorkspaceURL({
      subdomain,
      pathname: '/verify',
      searchParams: {
        loginToken,
        ...(billingCheckoutSessionState ? { billingCheckoutSessionState } : {}),
      },
    });

    return url.toString();
  }

  async findInvitationForSignInUp({
    currentWorkspace,
    workspacePersonalInviteToken,
    email,
  }: {
    currentWorkspace?: Workspace | null;
    workspacePersonalInviteToken?: string;
    email?: string;
  }) {
    if (!currentWorkspace) return undefined;

    const qr = this.appTokenRepository.createQueryBuilder('appToken');

    qr.where('"appToken"."workspaceId" = :workspaceId', {
      workspaceId: currentWorkspace.id,
    }).andWhere('"appToken".type = :type', {
      type: AppTokenType.InvitationToken,
    });

    if (email) {
      qr.andWhere('"appToken".context->>\'email\' = :email', {
        email,
      });
    }

    if (workspacePersonalInviteToken) {
      qr.andWhere('"appToken".value = :personalInviteToken', {
        personalInviteToken: workspacePersonalInviteToken,
      });
    }

    return (await qr.getOne()) ?? undefined;
  }

  async findWorkspaceForSignInUp(
    params: {
      workspaceId?: string;
      workspaceInviteHash?: string;
    } & (
      | {
          authProvider: Exclude<WorkspaceAuthProvider, 'password'>;
          email: string;
        }
      | { authProvider: Extract<WorkspaceAuthProvider, 'password'> }
    ),
  ) {
    if (params.workspaceInviteHash) {
      return (
        (await this.workspaceRepository.findOneBy({
          inviteHash: params.workspaceInviteHash,
        })) ?? undefined
      );
    }

    if (params.authProvider !== 'password') {
      return (
        (await this.socialSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider(
          {
            email: params.email,
            authProvider: params.authProvider,
          },
          params.workspaceId,
        )) ?? undefined
      );
    }

    return undefined;
  }

  formatUserDataPayload(
    newUserPayload: SignInUpNewUserPayload,
    existingUser?: User | null,
  ): ExistingUserOrNewUser {
    return {
      userData: existingUser
        ? { type: 'existingUser', existingUser }
        : {
            type: 'newUser',
            newUserPayload,
          },
    };
  }

  async checkAccessForSignIn({
    userData,
    invitation,
    workspaceInviteHash,
    workspace,
  }: {
    workspaceInviteHash?: string;
  } & ExistingUserOrNewUser &
    SignInUpBaseParams) {
    const hasInvitation = invitation || workspaceInviteHash;
    const isTargetAnExistingWorkspace = !!workspace;
    const isAnExistingUser = userData.type === 'existingUser';

    if (!hasInvitation && isTargetAnExistingWorkspace && isAnExistingUser) {
      return await this.userService.hasUserAccessToWorkspaceOrThrow(
        userData.existingUser.id,
        workspace.id,
      );
    }

    if (!hasInvitation && isTargetAnExistingWorkspace && !isAnExistingUser) {
      throw new AuthException(
        'User does not have access to this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }
  }
}
