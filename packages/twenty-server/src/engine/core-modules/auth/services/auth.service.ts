import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'node:crypto';

import { Repository } from 'typeorm';
import { render } from '@react-email/components';
import { PasswordUpdateNotifyEmail } from 'twenty-emails';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { NodeEnvironment } from 'src/engine/integrations/environment/interfaces/node-environment.interface';

import { ChallengeInput } from 'src/engine/core-modules/auth/dto/challenge.input';
import { assert } from 'src/utils/assert';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { UserExists } from 'src/engine/core-modules/auth/dto/user-exists.entity';
import { WorkspaceInviteHashValid } from 'src/engine/core-modules/auth/dto/workspace-invite-hash-valid.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { UpdatePassword } from 'src/engine/core-modules/auth/dto/update-password.entity';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { AuthorizeApp } from 'src/engine/core-modules/auth/dto/authorize-app.entity';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';

import { TokenService } from './token.service';

export type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

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

    assert(user, "This user doesn't exist", NotFoundException);
    assert(user.passwordHash, 'Incorrect login method', ForbiddenException);

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    assert(isValid, 'Wrong password', ForbiddenException);

    return user;
  }

  async signInUp({
    email,
    password,
    workspaceInviteHash,
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
    picture?: string | null;
    fromSSO: boolean;
  }) {
    return await this.signInUpService.signInUp({
      email,
      password,
      firstName,
      lastName,
      workspaceInviteHash,
      picture,
      fromSSO,
    });
  }

  async verify(email: string): Promise<Verify> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['defaultWorkspace', 'workspaces', 'workspaces.workspace'],
    });

    assert(user, "This user doesn't exist", NotFoundException);

    assert(
      user.defaultWorkspace,
      'User has no default workspace',
      NotFoundException,
    );

    // passwordHash is hidden for security reasons
    user.passwordHash = '';
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (workspaceMember) {
      user.workspaceMember = workspaceMember;
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

  async impersonate(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['defaultWorkspace', 'workspaces', 'workspaces.workspace'],
    });

    assert(user, "This user doesn't exist", NotFoundException);

    if (!user.defaultWorkspace.allowImpersonation) {
      throw new ForbiddenException('Impersonation not allowed');
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
            : `${this.environmentService.get('CHROME_EXTENSION_REDIRECT_URL')}`,
      },
    ];

    const { clientId, codeChallenge } = authorizeAppInput;

    const client = apps.find((app) => app.id === clientId);

    if (!client) {
      throw new NotFoundException(`Invalid client '${clientId}'`);
    }

    if (!client.redirectUrl || !authorizeAppInput.redirectUrl) {
      throw new NotFoundException(`redirectUrl not found for '${clientId}'`);
    }

    if (client.redirectUrl !== authorizeAppInput.redirectUrl) {
      throw new ForbiddenException(`redirectUrl mismatch for '${clientId}'`);
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
    const user = await this.userRepository.findOneBy({ id: userId });

    assert(user, 'User not found', NotFoundException);

    const isPasswordValid = PASSWORD_REGEX.test(newPassword);

    assert(isPasswordValid, 'Password too weak', BadRequestException);

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
}
