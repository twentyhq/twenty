import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto, { randomUUID } from 'node:crypto';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordUpdateNotifyEmail } from 'twenty-emails';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';
import { type AuthorizeAppOutput } from 'src/engine/core-modules/auth/dto/authorize-app.dto';
import { type AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { type UpdatePasswordOutput } from 'src/engine/core-modules/auth/dto/update-password.dto';
import { type UserCredentialsInput } from 'src/engine/core-modules/auth/dto/user-credentials.input';
import { type CheckUserExistOutput } from 'src/engine/core-modules/auth/dto/user-exists.dto';
import { type WorkspaceInviteHashValidOutput } from 'src/engine/core-modules/auth/dto/workspace-invite-hash-valid.dto';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { type GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { type MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  type AuthProviderWithPasswordType,
  type ExistingUserOrNewUser,
  type SignInUpBaseParams,
  type SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceDomainConfig } from 'src/engine/core-modules/domain/workspace-domains/types/workspace-domain-config.type';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class AuthService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceAgnosticTokenService: WorkspaceAgnosticTokenService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly loginTokenService: LoginTokenService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly authSsoService: AuthSsoService,
    private readonly userService: UserService,
    private readonly signInUpService: SignInUpService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly i18nService: I18nService,
    private readonly auditService: AuditService,
  ) {}

  private async checkAccessAndUseInvitationOrThrow(
    workspace: WorkspaceEntity,
    user: UserEntity,
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
      await this.workspaceInvitationService.validatePersonalInvitation({
        workspacePersonalInviteToken: invitation.value,
        email: user.email,
      });
      await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
        user,
        workspace,
      );

      return;
    }

    throw new AuthException(
      'User is not a member of the workspace.',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
      {
        userFriendlyMessage: msg`User is not a member of the workspace.`,
      },
    );
  }

  async validateLoginWithPassword(
    input: UserCredentialsInput,
    targetWorkspace?: WorkspaceEntity,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        email: input.email,
      },
      relations: { userWorkspaces: true },
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (targetWorkspace && !targetWorkspace.isPasswordAuthEnabled) {
      const canBypass = await this.canUserBypassAuthProvider({
        user,
        workspace: targetWorkspace,
        provider: AuthProviderEnum.Password,
      });

      if (!canBypass) {
        throw new AuthException(
          'Email/Password auth is not enabled for this workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }
    }

    if (targetWorkspace) {
      await this.checkAccessAndUseInvitationOrThrow(targetWorkspace, user);
    }

    if (!user.passwordHash) {
      throw new AuthException(
        'Incorrect login method',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`User was not created with email/password`,
        },
      );
    }

    const isValid = await compareHash(input.password, user.passwordHash);

    if (!isValid) {
      throw new AuthException(
        'Wrong password',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`Wrong password.`,
        },
      );
    }

    await this.checkIsEmailVerified(user.isEmailVerified);

    return user;
  }

  async checkIsEmailVerified(isEmailVerified: boolean) {
    const isEmailVerificationRequired = this.twentyConfigService.get(
      'IS_EMAIL_VERIFICATION_REQUIRED',
    );

    if (isEmailVerificationRequired && !isEmailVerified) {
      throw new AuthException(
        'Email is not verified',
        AuthExceptionCode.EMAIL_NOT_VERIFIED,
      );
    }
  }

  private async validatePassword(
    userData: ExistingUserOrNewUser['userData'],
    authParams: Extract<
      AuthProviderWithPasswordType['authParams'],
      { provider: AuthProviderEnum.Password }
    >,
  ) {
    if (userData.type === 'newUser') {
      userData.newUserPayload.passwordHash =
        await this.signInUpService.generateHash(authParams.password);
    }

    if (userData.type === 'existingUser') {
      await this.signInUpService.validatePassword({
        password: authParams.password,
        passwordHash: userData.existingUser.passwordHash,
      });
    }
  }

  private async isAuthProviderEnabledOrThrow(
    userData: ExistingUserOrNewUser['userData'],
    authParams: AuthProviderWithPasswordType['authParams'],
    workspace: WorkspaceEntity | undefined | null,
  ) {
    if (authParams.provider === AuthProviderEnum.Password) {
      await this.validatePassword(userData, authParams);
    }

    if (isDefined(workspace)) {
      const isProviderEnabled = workspaceValidator.isAuthEnabled(
        authParams.provider,
        workspace,
      );

      if (isProviderEnabled) {
        return;
      }

      const existingUser =
        userData.type === 'existingUser' ? userData.existingUser : undefined;

      if (
        existingUser &&
        (await this.canUserBypassAuthProvider({
          user: existingUser,
          workspace,
          provider: authParams.provider,
        }))
      ) {
        return;
      }

      workspaceValidator.isAuthEnabledOrThrow(authParams.provider, workspace);
    }
  }

  private async canUserBypassAuthProvider({
    user,
    workspace,
    provider,
  }: {
    user: UserEntity;
    workspace: WorkspaceEntity;
    provider: AuthProviderEnum;
  }): Promise<boolean> {
    const bypassEnabled = (() => {
      switch (provider) {
        case AuthProviderEnum.Password:
          return workspace.isPasswordAuthBypassEnabled;
        case AuthProviderEnum.Google:
          return workspace.isGoogleAuthBypassEnabled;
        case AuthProviderEnum.Microsoft:
          return workspace.isMicrosoftAuthBypassEnabled;
        default:
          return false;
      }
    })();

    if (!bypassEnabled) {
      return false;
    }

    const userWorkspace = user.userWorkspaces?.find(
      (userWorkspace) => userWorkspace.workspaceId === workspace.id,
    );

    if (!userWorkspace) {
      return false;
    }

    return await this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId: userWorkspace.id,
      workspaceId: workspace.id,
      setting: PermissionFlagType.SSO_BYPASS,
    });
  }

  async signInUp(
    params: SignInUpBaseParams &
      ExistingUserOrNewUser &
      AuthProviderWithPasswordType,
  ) {
    await this.isAuthProviderEnabledOrThrow(
      params.userData,
      params.authParams,
      params.workspace,
    );

    if (params.userData.type === 'newUser') {
      const partialUserWithPicture =
        await this.signInUpService.computePartialUserFromUserPayload(
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

  async verify(
    email: string,
    workspaceId: string,
    authProvider: AuthProviderEnum,
  ): Promise<AuthTokens> {
    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Email is required.`,
        },
      );
    }

    const user = await this.userService.findUserByEmail(email);

    assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    // passwordHash is hidden for security reasons
    user.passwordHash = '';

    const accessToken = await this.accessTokenService.generateAccessToken({
      userId: user.id,
      workspaceId,
      authProvider,
    });
    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      userId: user.id,
      workspaceId,
      authProvider,
      targetedTokenType: JwtTokenTypeEnum.ACCESS,
    });

    return {
      tokens: {
        accessOrWorkspaceAgnosticToken: accessToken,
        refreshToken,
      },
    };
  }

  async generateImpersonationAccessTokenAndRefreshToken({
    workspaceId,
    impersonatorUserWorkspaceId,
    impersonatedUserWorkspaceId,
    impersonatorUserId,
    impersonatedUserId,
  }: {
    workspaceId: string;
    impersonatorUserWorkspaceId: string;
    impersonatedUserWorkspaceId: string;
    impersonatorUserId: string;
    impersonatedUserId: string;
  }): Promise<AuthTokens> {
    const correlationId = randomUUID();

    const analytics = this.auditService.createContext({
      workspaceId,
      userId: impersonatorUserId,
    });

    analytics.insertWorkspaceEvent('Monitoring', {
      eventName: 'workspace.impersonation.attempted',
      message: `correlationId=${correlationId}; impersonatorUserWorkspaceId=${impersonatorUserWorkspaceId}; targetUserWorkspaceId=${impersonatedUserWorkspaceId}; workspaceId=${workspaceId}`,
    });

    const accessToken = await this.accessTokenService.generateAccessToken({
      userId: impersonatedUserId,
      workspaceId,
      authProvider: AuthProviderEnum.Impersonation,
      isImpersonating: true,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId,
    });
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      {
        userId: impersonatedUserId,
        workspaceId,
        authProvider: AuthProviderEnum.Impersonation,
        targetedTokenType: JwtTokenTypeEnum.ACCESS,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId,
      },
      true,
    );

    analytics.insertWorkspaceEvent('Monitoring', {
      eventName: 'workspace.impersonation.issued',
      message: `correlationId=${correlationId}; impersonatorUserWorkspaceId=${impersonatorUserWorkspaceId}; targetUserWorkspaceId=${impersonatedUserWorkspaceId}; workspaceId=${workspaceId}`,
    });

    return {
      tokens: {
        accessOrWorkspaceAgnosticToken: accessToken,
        refreshToken,
      },
    };
  }

  async countAvailableWorkspacesByEmail(email: string): Promise<number> {
    return Object.values(
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(email),
    ).flat(2).length;
  }

  async checkUserExists(email: string): Promise<CheckUserExistOutput> {
    const user = await this.userService.findUserByEmail(email);

    const isUserExist = isDefined(user);

    return {
      exists: isUserExist,
      availableWorkspacesCount:
        await this.countAvailableWorkspacesByEmail(email),
      isEmailVerified: isUserExist ? user.isEmailVerified : false,
    };
  }

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValidOutput> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    return { isValid: !!workspace };
  }

  async generateAuthorizationCode(
    authorizeAppInput: AuthorizeAppInput,
    user: UserEntity,
    workspace: WorkspaceEntity,
  ): Promise<AuthorizeAppOutput> {
    // TODO: replace with db call to - third party app table
    const apps = [
      {
        id: 'chrome',
        name: 'Chrome Extension',
        redirectUrl:
          this.twentyConfigService.get('NODE_ENV') ===
          NodeEnvironment.DEVELOPMENT
            ? authorizeAppInput.redirectUrl
            : `https://${this.twentyConfigService.get(
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
  ): Promise<UpdatePasswordOutput> {
    if (!userId) {
      throw new AuthException(
        'User ID is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { userWorkspaces: true },
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    const [firstUserWorkspace] = user.userWorkspaces;

    if (!firstUserWorkspace) {
      throw new AuthException(
        'User does not have a workspace',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const isPasswordValid = PASSWORD_REGEX.test(newPassword);

    if (!isPasswordValid) {
      throw new AuthException(
        'Password is too weak',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Password is too weak.`,
        },
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    const emailTemplate = PasswordUpdateNotifyEmail({
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      link: this.domainServerConfigService.getBaseUrl().toString(),
      locale: firstUserWorkspace.locale,
    });

    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    const passwordChangedMsg = msg`Your Password Has Been Successfully Changed`;
    const i18n = this.i18nService.getI18nInstance(firstUserWorkspace.locale);
    const subject = i18n._(passwordChangedMsg);

    await this.emailService.send({
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      to: user.email,
      subject,
      text,
      html,
    });

    return { success: true };
  }

  async findWorkspaceFromInviteHashOrFail(
    inviteHash: string,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace does not exist',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Workspace does not exist.`,
        },
      );
    }

    return workspace;
  }

  computeRedirectURI({
    loginToken,
    workspace,
    billingCheckoutSessionState,
  }: {
    loginToken: string;
    workspace: WorkspaceDomainConfig;
    billingCheckoutSessionState?: string;
  }) {
    const url = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: AppPath.Verify,
      searchParams: {
        loginToken,
        ...(billingCheckoutSessionState ? { billingCheckoutSessionState } : {}),
      },
    });

    return url.toString();
  }

  async findInvitationForSignInUp(
    params: {
      currentWorkspace: WorkspaceEntity;
    } & ({ workspacePersonalInviteToken: string } | { email: string }),
  ) {
    const qr = this.appTokenRepository
      .createQueryBuilder('appToken')
      .where('"appToken"."workspaceId" = :workspaceId', {
        workspaceId: params.currentWorkspace.id,
      })
      .andWhere('"appToken".type = :type', {
        type: AppTokenType.InvitationToken,
      });

    if ('workspacePersonalInviteToken' in params) {
      qr.andWhere('"appToken".value = :personalInviteToken', {
        personalInviteToken: params.workspacePersonalInviteToken,
      });
    }

    if ('email' in params) {
      qr.andWhere('"appToken".context->>\'email\' = :email', {
        email: params.email,
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
          authProvider: Exclude<AuthProviderEnum, AuthProviderEnum.Password>;
          email: string;
        }
      | { authProvider: Extract<AuthProviderEnum, AuthProviderEnum.Password> }
    ),
  ) {
    if (params.workspaceInviteHash) {
      return (
        (await this.workspaceRepository.findOne({
          where: {
            inviteHash: params.workspaceInviteHash,
          },
          relations: ['approvedAccessDomains'],
        })) ?? undefined
      );
    }

    if (params.authProvider !== AuthProviderEnum.Password) {
      return (
        (await this.authSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider(
          {
            email: params.email,
            authProvider: params.authProvider,
          },
          params.workspaceId,
        )) ?? undefined
      );
    }

    return params.workspaceId
      ? await this.workspaceRepository.findOne({
          where: {
            id: params.workspaceId,
          },
          relations: ['approvedAccessDomains'],
        })
      : undefined;
  }

  formatUserDataPayload(
    newUserPayload: SignInUpNewUserPayload,
    existingUser?: UserEntity | null,
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
    const hasPublicInviteLink = !!workspaceInviteHash;
    const hasPersonalInvitation = !!invitation;
    const isInvitedToWorkspace = hasPersonalInvitation || hasPublicInviteLink;
    const isTargetAnExistingWorkspace = !!workspace;
    const isAnExistingUser = userData.type === 'existingUser';

    const email =
      userData.type === 'newUser'
        ? userData.newUserPayload.email
        : userData.existingUser.email;

    if (
      workspace?.approvedAccessDomains.some(
        (trustDomain) =>
          trustDomain.isValidated && trustDomain.domain === email.split('@')[1],
      )
    ) {
      return;
    }

    if (
      hasPublicInviteLink &&
      !hasPersonalInvitation &&
      workspace &&
      !workspace.isPublicInviteLinkEnabled
    ) {
      throw new AuthException(
        'Public invite link is disabled for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (
      !isInvitedToWorkspace &&
      isTargetAnExistingWorkspace &&
      isAnExistingUser
    ) {
      return await this.userService.hasUserAccessToWorkspaceOrThrow(
        userData.existingUser.id,
        workspace.id,
      );
    }

    if (
      !isInvitedToWorkspace &&
      isTargetAnExistingWorkspace &&
      !isAnExistingUser
    ) {
      throw new AuthException(
        'User does not have access to this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`User does not have access to this workspace`,
        },
      );
    }
  }

  async signInUpWithSocialSSO(
    {
      firstName,
      lastName,
      email: rawEmail,
      picture,
      workspaceInviteHash,
      workspaceId,
      billingCheckoutSessionState,
      action,
      locale,
    }: MicrosoftRequest['user'] | GoogleRequest['user'],
    authProvider: AuthProviderEnum.Google | AuthProviderEnum.Microsoft,
  ): Promise<string> {
    const email = rawEmail.toLowerCase();

    const availableWorkspacesCount =
      action === 'list-available-workspaces'
        ? await this.countAvailableWorkspacesByEmail(email)
        : 0;

    const existingUser =
      await this.userService.findUserByEmailWithWorkspaces(email);

    if (
      !workspaceId &&
      !workspaceInviteHash &&
      action === 'list-available-workspaces' &&
      availableWorkspacesCount > 1
    ) {
      const user =
        existingUser ??
        (await this.signInUpService.signUpWithoutWorkspace(
          {
            firstName,
            lastName,
            email,
            picture,
            isEmailAlreadyVerified: true,
          },
          {
            provider: authProvider,
          },
        ));

      const url = this.domainServerConfigService.buildBaseUrl({
        pathname: AppPath.SignInUp,
        searchParams: {
          tokenPair: JSON.stringify({
            accessOrWorkspaceAgnosticToken:
              await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
                {
                  userId: user.id,
                  authProvider,
                },
              ),
            refreshToken: await this.refreshTokenService.generateRefreshToken({
              userId: user.id,
              authProvider,
              targetedTokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
            }),
          }),
        },
      });

      return url.toString();
    }

    const currentWorkspace =
      action === 'create-new-workspace'
        ? undefined
        : await this.findWorkspaceForSignInUp({
            workspaceId,
            workspaceInviteHash,
            email,
            authProvider,
          });

    try {
      const invitation =
        currentWorkspace && email
          ? await this.findInvitationForSignInUp({
              currentWorkspace,
              email,
            })
          : undefined;

      const { userData } = this.formatUserDataPayload(
        {
          firstName,
          lastName,
          email,
          picture,
          locale,
          isEmailAlreadyVerified: true,
        },
        existingUser,
      );

      await this.checkAccessForSignIn({
        userData,
        invitation,
        workspaceInviteHash,
        workspace: currentWorkspace,
      });

      const { user, workspace } = await this.signInUp({
        invitation,
        workspace: currentWorkspace,
        userData,
        authParams: {
          provider: authProvider,
        },
        billingCheckoutSessionState,
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
        authProvider,
      );

      return this.computeRedirectURI({
        loginToken: loginToken.token,
        workspace,
        billingCheckoutSessionState,
      });
    } catch (error) {
      return this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error,
        workspace:
          this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
            currentWorkspace,
          ),
        pathname: AppPath.Verify,
      });
    }
  }
}
