import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApiKeyTokenInput } from 'src/engine/core-modules/auth/dto/api-key-token.input';
import { AppTokenInput } from 'src/engine/core-modules/auth/dto/app-token.input';
import { AuthorizeApp } from 'src/engine/core-modules/auth/dto/authorize-app.entity';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { EmailPasswordResetLink } from 'src/engine/core-modules/auth/dto/email-password-reset-link.entity';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { ExchangeAuthCode } from 'src/engine/core-modules/auth/dto/exchange-auth-code.entity';
import { ExchangeAuthCodeInput } from 'src/engine/core-modules/auth/dto/exchange-auth-code.input';
import { GenerateJwtInput } from 'src/engine/core-modules/auth/dto/generate-jwt.input';
import { InvalidatePassword } from 'src/engine/core-modules/auth/dto/invalidate-password.entity';
import { TransientToken } from 'src/engine/core-modules/auth/dto/transient-token.entity';
import { UpdatePasswordViaResetTokenInput } from 'src/engine/core-modules/auth/dto/update-password-via-reset-token.input';
import { ValidatePasswordResetToken } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.entity';
import { ValidatePasswordResetTokenInput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.input';
import { authGraphqlApiExceptionHandler } from 'src/engine/core-modules/auth/utils/auth-graphql-api-exception-handler.util';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { CaptchaGuard } from 'src/engine/integrations/captcha/captcha.guard';

import { ChallengeInput } from './dto/challenge.input';
import { ImpersonateInput } from './dto/impersonate.input';
import { LoginToken } from './dto/login-token.entity';
import { SignUpInput } from './dto/sign-up.input';
import { ApiKeyToken, AuthTokens } from './dto/token.entity';
import { UserExists } from './dto/user-exists.entity';
import { CheckUserExistsInput } from './dto/user-exists.input';
import { Verify } from './dto/verify.entity';
import { VerifyInput } from './dto/verify.input';
import { WorkspaceInviteHashValid } from './dto/workspace-invite-hash-valid.entity';
import { WorkspaceInviteHashValidInput } from './dto/workspace-invite-hash.input';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Resolver()
export class AuthResolver {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  @UseGuards(CaptchaGuard)
  @Query(() => UserExists)
  async checkUserExists(
    @Args() checkUserExistsInput: CheckUserExistsInput,
  ): Promise<UserExists | void> {
    try {
      const { exists } = await this.authService.checkUserExists(
        checkUserExistsInput.email,
      );

      return { exists };
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Query(() => WorkspaceInviteHashValid)
  async checkWorkspaceInviteHashIsValid(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceInviteHashValid | void> {
    try {
      return await this.authService.checkWorkspaceInviteHashIsValid(
        workspaceInviteHashValidInput.inviteHash,
      );
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Query(() => Workspace)
  async findWorkspaceFromInviteHash(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<Workspace | void> {
    try {
      return await this.authService.findWorkspaceFromInviteHash(
        workspaceInviteHashValidInput.inviteHash,
      );
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => LoginToken)
  async challenge(
    @Args() challengeInput: ChallengeInput,
  ): Promise<LoginToken | void> {
    try {
      const user = await this.authService.challenge(challengeInput);
      const loginToken = await this.tokenService.generateLoginToken(user.email);

      return { loginToken };
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => LoginToken)
  async signUp(@Args() signUpInput: SignUpInput): Promise<LoginToken | void> {
    try {
      const user = await this.authService.signInUp({
        ...signUpInput,
        fromSSO: false,
      });

      const loginToken = await this.tokenService.generateLoginToken(user.email);

      return { loginToken };
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => ExchangeAuthCode)
  async exchangeAuthorizationCode(
    @Args() exchangeAuthCodeInput: ExchangeAuthCodeInput,
  ) {
    try {
      const tokens = await this.tokenService.verifyAuthorizationCode(
        exchangeAuthCodeInput,
      );

      return tokens;
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => TransientToken)
  @UseGuards(JwtAuthGuard)
  async generateTransientToken(
    @AuthUser() user: User,
  ): Promise<TransientToken | void> {
    try {
      const workspaceMember = await this.userService.loadWorkspaceMember(user);

      if (!workspaceMember) {
        return;
      }
      const transientToken = await this.tokenService.generateTransientToken(
        workspaceMember.id,
        user.id,
        user.defaultWorkspace.id,
      );

      return { transientToken };
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => Verify)
  async verify(@Args() verifyInput: VerifyInput): Promise<Verify | void> {
    try {
      const email = await this.tokenService.verifyLoginToken(
        verifyInput.loginToken,
      );

      const result = await this.authService.verify(email);

      return result;
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => AuthorizeApp)
  @UseGuards(JwtAuthGuard)
  async authorizeApp(
    @Args() authorizeAppInput: AuthorizeAppInput,
    @AuthUser() user: User,
  ): Promise<AuthorizeApp | void> {
    try {
      const authorizedApp = await this.authService.generateAuthorizationCode(
        authorizeAppInput,
        user,
      );

      return authorizedApp;
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => AuthTokens)
  @UseGuards(JwtAuthGuard)
  async generateJWT(
    @AuthUser() user: User,
    @Args() args: GenerateJwtInput,
  ): Promise<AuthTokens | void> {
    try {
      const token = await this.tokenService.generateSwitchWorkspaceToken(
        user,
        args.workspaceId,
      );

      return token;
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => AuthTokens)
  async renewToken(@Args() args: AppTokenInput): Promise<AuthTokens | void> {
    try {
      const tokens = await this.tokenService.generateTokensFromRefreshToken(
        args.appToken,
      );

      return { tokens: tokens };
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
  ): Promise<Verify | void> {
    try {
      return await this.authService.impersonate(impersonateInput.userId, user);
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ApiKeyToken)
  async generateApiKeyToken(
    @Args() args: ApiKeyTokenInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ApiKeyToken | undefined> {
    try {
      return await this.tokenService.generateApiKeyToken(
        workspaceId,
        args.apiKeyId,
        args.expiresAt,
      );
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => EmailPasswordResetLink)
  async emailPasswordResetLink(
    @Args() emailPasswordResetInput: EmailPasswordResetLinkInput,
  ): Promise<EmailPasswordResetLink | void> {
    try {
      const resetToken = await this.tokenService.generatePasswordResetToken(
        emailPasswordResetInput.email,
      );

      return await this.tokenService.sendEmailPasswordResetLink(
        resetToken,
        emailPasswordResetInput.email,
      );
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => InvalidatePassword)
  async updatePasswordViaResetToken(
    @Args()
    { passwordResetToken, newPassword }: UpdatePasswordViaResetTokenInput,
  ): Promise<InvalidatePassword | void> {
    try {
      const { id } =
        await this.tokenService.validatePasswordResetToken(passwordResetToken);

      await this.authService.updatePassword(id, newPassword);

      return await this.tokenService.invalidatePasswordResetToken(id);
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }

  @Query(() => ValidatePasswordResetToken)
  async validatePasswordResetToken(
    @Args() args: ValidatePasswordResetTokenInput,
  ): Promise<ValidatePasswordResetToken | void> {
    try {
      return this.tokenService.validatePasswordResetToken(
        args.passwordResetToken,
      );
    } catch (error) {
      authGraphqlApiExceptionHandler(error);
    }
  }
}
