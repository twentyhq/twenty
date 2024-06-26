import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppTokenInput } from 'src/engine/core-modules/auth/dto/app-token.input';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { assert } from 'src/utils/assert';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ApiKeyTokenInput } from 'src/engine/core-modules/auth/dto/api-key-token.input';
import { ValidatePasswordResetToken } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.entity';
import { TransientToken } from 'src/engine/core-modules/auth/dto/transient-token.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { ValidatePasswordResetTokenInput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.input';
import { UpdatePasswordViaResetTokenInput } from 'src/engine/core-modules/auth/dto/update-password-via-reset-token.input';
import { EmailPasswordResetLink } from 'src/engine/core-modules/auth/dto/email-password-reset-link.entity';
import { InvalidatePassword } from 'src/engine/core-modules/auth/dto/invalidate-password.entity';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { GenerateJwtInput } from 'src/engine/core-modules/auth/dto/generate-jwt.input';
import { AuthorizeApp } from 'src/engine/core-modules/auth/dto/authorize-app.entity';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { ExchangeAuthCodeInput } from 'src/engine/core-modules/auth/dto/exchange-auth-code.input';
import { ExchangeAuthCode } from 'src/engine/core-modules/auth/dto/exchange-auth-code.entity';
import { CaptchaGuard } from 'src/engine/integrations/captcha/captcha.guard';

import { ApiKeyToken, AuthTokens } from './dto/token.entity';
import { TokenService } from './services/token.service';
import { Verify } from './dto/verify.entity';
import { VerifyInput } from './dto/verify.input';
import { AuthService } from './services/auth.service';
import { LoginToken } from './dto/login-token.entity';
import { ChallengeInput } from './dto/challenge.input';
import { UserExists } from './dto/user-exists.entity';
import { CheckUserExistsInput } from './dto/user-exists.input';
import { WorkspaceInviteHashValid } from './dto/workspace-invite-hash-valid.entity';
import { WorkspaceInviteHashValidInput } from './dto/workspace-invite-hash.input';
import { SignUpInput } from './dto/sign-up.input';
import { ImpersonateInput } from './dto/impersonate.input';

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
  ) {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash: workspaceInviteHashValidInput.inviteHash,
    });

    if (!workspace) {
      throw new BadRequestException('Workspace does not exist');
    }

    return workspace;
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
  @UseGuards(JwtAuthGuard)
  async generateTransientToken(
    @AuthUser() user: User,
  ): Promise<TransientToken | void> {
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
  }

  @Mutation(() => Verify)
  async verify(@Args() verifyInput: VerifyInput): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );

    assert(email, 'Invalid token', ForbiddenException);

    const result = await this.authService.verify(email);

    return result;
  }

  @Mutation(() => AuthorizeApp)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
    if (!args.appToken) {
      throw new BadRequestException('Refresh token is mendatory');
    }

    const tokens = await this.tokenService.generateTokensFromRefreshToken(
      args.appToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
  ): Promise<Verify> {
    // Check if user can impersonate
    assert(user.canImpersonate, 'User cannot impersonate', ForbiddenException);

    return this.authService.impersonate(impersonateInput.userId);
  }

  @UseGuards(JwtAuthGuard)
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
    @Args() args: UpdatePasswordViaResetTokenInput,
  ): Promise<InvalidatePassword> {
    const { id } = await this.tokenService.validatePasswordResetToken(
      args.passwordResetToken,
    );

    assert(id, 'User not found', NotFoundException);

    const { success } = await this.authService.updatePassword(
      id,
      args.newPassword,
    );

    assert(success, 'Password update failed', InternalServerErrorException);

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
