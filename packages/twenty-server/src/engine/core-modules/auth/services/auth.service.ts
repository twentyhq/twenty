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
import { UpdatePassword } from 'src/engine/core-modules/auth/dto/update-password.entity';
import { UserExists } from 'src/engine/core-modules/auth/dto/user-exists.entity';
import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { WorkspaceInviteHashValid } from 'src/engine/core-modules/auth/dto/workspace-invite-hash-valid.entity';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
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

  async challenge(challengeInput: ChallengeInput) {
    const user = await this.userRepository.findOneBy({
      email: challengeInput.email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

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

    return user;
  }

  async signInUp({
    email,
    password,
    workspaceInviteHash,
    workspacePersonalInviteToken,
    firstName,
    lastName,
    picture,
    fromSSO,
  }: {
    email: string;
    password?: string;
    firstName?: string | null;
    lastName?: string | null;
    workspaceInviteHash?: string | null;
    workspacePersonalInviteToken?: string | null;
    picture?: string | null;
    fromSSO: boolean;
  }) {
    return await this.signInUpService.signInUp({
      email,
      password,
      firstName,
      lastName,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      picture,
      fromSSO,
    });
  }

  async verify(email: string): Promise<Verify> {
    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['defaultWorkspace', 'workspaces', 'workspaces.workspace'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (!user.defaultWorkspace) {
      throw new AuthException(
        'User has no default workspace',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    // passwordHash is hidden for security reasons
    user.passwordHash = '';

    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async checkUserExists(email: string): Promise<UserExists> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    return { exists: !!user };
  }

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValid> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    return { isValid: !!workspace };
  }

  async impersonate(userIdToImpersonate: string, userImpersonating: User) {
    if (!userImpersonating.canImpersonate) {
      throw new AuthException(
        'User cannot impersonate',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userIdToImpersonate,
      },
      relations: ['defaultWorkspace', 'workspaces', 'workspaces.workspace'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (!user.defaultWorkspace.allowImpersonation) {
      throw new AuthException(
        'Impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async generateAuthorizationCode(
    authorizeAppInput: AuthorizeAppInput,
    user: User,
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
          workspaceId: user.defaultWorkspaceId,
          expiresAt,
        },
        {
          value: authorizationCode,
          type: AppTokenType.AuthorizationCode,
          userId: user.id,
          workspaceId: user.defaultWorkspaceId,
          expiresAt,
        },
      ]);

      await this.appTokenRepository.save(tokens);
    } else {
      const token = this.appTokenRepository.create({
        value: authorizationCode,
        type: AppTokenType.AuthorizationCode,
        userId: user.id,
        workspaceId: user.defaultWorkspaceId,
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
      link: this.environmentService.get('FRONT_BASE_URL'),
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
}
