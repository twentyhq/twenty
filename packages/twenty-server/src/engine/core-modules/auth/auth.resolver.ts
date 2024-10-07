import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

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
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

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
import { TokenService } from './token/services/token.service';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  @UseGuards(CaptchaGuard)
  @Query(() => UserExists)
  async checkUserExists(
    @Args() checkUserExistsInput: CheckUserExistsInput,
  ): Promise<UserExists> {
    const { exists } = await this.authService.checkUserExists(
      checkUserExistsInput.email,
    );

    return { exists };
  }

  @Query(() => WorkspaceInviteHashValid)
  async checkWorkspaceInviteHashIsValid(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceInviteHashValid> {
    return await this.authService.checkWorkspaceInviteHashIsValid(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Query(() => Workspace)
  async findWorkspaceFromInviteHash(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<Workspace> {
    return await this.authService.findWorkspaceFromInviteHashOrFail(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => LoginToken)
  async challenge(@Args() challengeInput: ChallengeInput): Promise<LoginToken> {
    const user = await this.authService.challenge(challengeInput);
    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return { loginToken };
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => LoginToken)
  async signUp(@Args() signUpInput: SignUpInput): Promise<LoginToken> {
    const user = await this.authService.signInUp({
      ...signUpInput,
      fromSSO: false,
    });

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return { loginToken };
  }

  @Mutation(() => ExchangeAuthCode)
  async exchangeAuthorizationCode(
    @Args() exchangeAuthCodeInput: ExchangeAuthCodeInput,
  ) {
    const tokens = await this.tokenService.verifyAuthorizationCode(
      exchangeAuthCodeInput,
    );

    return tokens;
  }

  @Mutation(() => TransientToken)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async generateTransientToken(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<TransientToken | void> {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!workspaceMember) {
      return;
    }
    const transientToken = await this.tokenService.generateTransientToken(
      workspaceMember.id,
      user.id,
      user.defaultWorkspaceId,
    );

    return { transientToken };
  }

  @Mutation(() => Verify)
  async verify(@Args() verifyInput: VerifyInput): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );

    const result = await this.authService.verify(email);

    return result;
  }

  @Mutation(() => AuthorizeApp)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async authorizeApp(
    @Args() authorizeAppInput: AuthorizeAppInput,
    @AuthUser() user: User,
  ): Promise<AuthorizeApp> {
    const authorizedApp = await this.authService.generateAuthorizationCode(
      authorizeAppInput,
      user,
    );

    return authorizedApp;
  }

  @Mutation(() => AuthTokens)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async generateJWT(
    @AuthUser() user: User,
    @Args() args: GenerateJwtInput,
  ): Promise<AuthTokens> {
    const token = await this.tokenService.generateSwitchWorkspaceToken(
      user,
      args.workspaceId,
    );

    return token;
  }

  @Mutation(() => AuthTokens)
  async renewToken(@Args() args: AppTokenInput): Promise<AuthTokens> {
    const tokens = await this.tokenService.generateTokensFromRefreshToken(
      args.appToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
  ): Promise<Verify> {
    return await this.authService.impersonate(impersonateInput.userId, user);
  }

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => ApiKeyToken)
  async generateApiKeyToken(
    @Args() args: ApiKeyTokenInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ApiKeyToken | undefined> {
    return await this.tokenService.generateApiKeyToken(
      workspaceId,
      args.apiKeyId,
      args.expiresAt,
    );
  }

  @Mutation(() => EmailPasswordResetLink)
  async emailPasswordResetLink(
    @Args() emailPasswordResetInput: EmailPasswordResetLinkInput,
  ): Promise<EmailPasswordResetLink> {
    const resetToken = await this.tokenService.generatePasswordResetToken(
      emailPasswordResetInput.email,
    );

    return await this.tokenService.sendEmailPasswordResetLink(
      resetToken,
      emailPasswordResetInput.email,
    );
  }

  @Mutation(() => InvalidatePassword)
  async updatePasswordViaResetToken(
    @Args()
    { passwordResetToken, newPassword }: UpdatePasswordViaResetTokenInput,
  ): Promise<InvalidatePassword> {
    const { id } =
      await this.tokenService.validatePasswordResetToken(passwordResetToken);

    await this.authService.updatePassword(id, newPassword);

    return await this.tokenService.invalidatePasswordResetToken(id);
  }

  @Query(() => ValidatePasswordResetToken)
  async validatePasswordResetToken(
    @Args() args: ValidatePasswordResetTokenInput,
  ): Promise<ValidatePasswordResetToken> {
    return this.tokenService.validatePasswordResetToken(
      args.passwordResetToken,
    );
  }
}
