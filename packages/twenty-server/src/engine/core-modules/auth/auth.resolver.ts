import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { SOURCE_LOCALE } from 'twenty-shared';
import { Repository } from 'typeorm';

import { ApiKeyTokenInput } from 'src/engine/core-modules/auth/dto/api-key-token.input';
import { AppTokenInput } from 'src/engine/core-modules/auth/dto/app-token.input';
import { AuthorizeApp } from 'src/engine/core-modules/auth/dto/authorize-app.entity';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { EmailPasswordResetLink } from 'src/engine/core-modules/auth/dto/email-password-reset-link.entity';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { InvalidatePassword } from 'src/engine/core-modules/auth/dto/invalidate-password.entity';
import { TransientToken } from 'src/engine/core-modules/auth/dto/transient-token.entity';
import { UpdatePasswordViaResetTokenInput } from 'src/engine/core-modules/auth/dto/update-password-via-reset-token.input';
import { ValidatePasswordResetToken } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.entity';
import { ValidatePasswordResetTokenInput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApiKeyService } from 'src/engine/core-modules/auth/services/api-key.service';
// import { OAuthService } from 'src/engine/core-modules/auth/services/oauth.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { GetLoginTokenFromEmailVerificationTokenInput } from 'src/engine/core-modules/auth/dto/get-login-token-from-email-verification-token.input';
import { SignUpOutput } from 'src/engine/core-modules/auth/dto/sign-up.output';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { EmailVerificationTokenService } from 'src/engine/core-modules/auth/token/services/email-verification-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { OriginHeader } from 'src/engine/decorators/auth/origin-header.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { GetAuthTokensFromLoginTokenInput } from './dto/get-auth-tokens-from-login-token.input';
import { GetLoginTokenFromCredentialsInput } from './dto/get-login-token-from-credentials.input';
import { LoginToken } from './dto/login-token.entity';
import { SignUpInput } from './dto/sign-up.input';
import { ApiKeyToken, AuthTokens } from './dto/token.entity';
import { UserExistsOutput } from './dto/user-exists.entity';
import { CheckUserExistsInput } from './dto/user-exists.input';
import { WorkspaceInviteHashValid } from './dto/workspace-invite-hash-valid.entity';
import { WorkspaceInviteHashValidInput } from './dto/workspace-invite-hash.input';
import { AuthService } from './services/auth.service';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AuthResolver {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private authService: AuthService,
    private renewTokenService: RenewTokenService,
    private userService: UserService,
    private apiKeyService: ApiKeyService,
    private resetPasswordService: ResetPasswordService,
    private loginTokenService: LoginTokenService,
    private transientTokenService: TransientTokenService,
    private emailVerificationService: EmailVerificationService,
    // private oauthService: OAuthService,
    private domainManagerService: DomainManagerService,
    private userWorkspaceService: UserWorkspaceService,
    private emailVerificationTokenService: EmailVerificationTokenService,
  ) {}

  @UseGuards(CaptchaGuard)
  @Query(() => UserExistsOutput)
  async checkUserExists(
    @Args() checkUserExistsInput: CheckUserExistsInput,
  ): Promise<typeof UserExistsOutput> {
    return await this.authService.checkUserExists(checkUserExistsInput.email);
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
  async getLoginTokenFromCredentials(
    @Args()
    getLoginTokenFromCredentialsInput: GetLoginTokenFromCredentialsInput,
    @OriginHeader() origin: string,
  ): Promise<LoginToken> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const user = await this.authService.getLoginTokenFromCredentials(
      getLoginTokenFromCredentialsInput,
      workspace,
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
    );

    return { loginToken };
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => LoginToken)
  async getLoginTokenFromEmailVerificationToken(
    @Args()
    getLoginTokenFromEmailVerificationTokenInput: GetLoginTokenFromEmailVerificationTokenInput,
    @OriginHeader() origin: string,
  ) {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const user =
      await this.emailVerificationTokenService.validateEmailVerificationTokenOrThrow(
        getLoginTokenFromEmailVerificationTokenInput.emailVerificationToken,
      );

    await this.userService.markEmailAsVerified(user.id);

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
    );

    return { loginToken };
  }

  @UseGuards(CaptchaGuard)
  @Mutation(() => SignUpOutput)
  async signUp(@Args() signUpInput: SignUpInput): Promise<SignUpOutput> {
    const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
      workspaceInviteHash: signUpInput.workspaceInviteHash,
      authProvider: 'password',
      workspaceId: signUpInput.workspaceId,
    });

    const invitation =
      currentWorkspace && signUpInput.workspacePersonalInviteToken
        ? await this.authService.findInvitationForSignInUp({
            currentWorkspace,
            workspacePersonalInviteToken:
              signUpInput.workspacePersonalInviteToken,
          })
        : undefined;

    const existingUser = await this.userRepository.findOne({
      where: {
        email: signUpInput.email,
      },
    });

    const { userData } = this.authService.formatUserDataPayload(
      {
        email: signUpInput.email,
        locale: signUpInput.locale,
      },
      existingUser,
    );

    await this.authService.checkAccessForSignIn({
      userData,
      invitation,
      workspaceInviteHash: signUpInput.workspaceInviteHash,
      workspace: currentWorkspace,
    });

    const { user, workspace } = await this.authService.signInUp({
      userData,
      workspace: currentWorkspace,
      invitation,
      authParams: {
        provider: 'password',
        password: signUpInput.password,
      },
    });

    await this.emailVerificationService.sendVerificationEmail(
      user.id,
      user.email,
      workspace,
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
    );

    return {
      loginToken,
      workspace: {
        id: workspace.id,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
      },
    };
  }

  // @Mutation(() => ExchangeAuthCode)
  // async exchangeAuthorizationCode(
  //   @Args() exchangeAuthCodeInput: ExchangeAuthCodeInput,
  // ) {
  //   return await this.oauthService.verifyAuthorizationCode(
  //     exchangeAuthCodeInput,
  //   );
  // }

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
    const transientToken =
      await this.transientTokenService.generateTransientToken(
        workspaceMember.id,
        user.id,
        workspace.id,
      );

    return { transientToken };
  }

  @Mutation(() => AuthTokens)
  async getAuthTokensFromLoginToken(
    @Args() getAuthTokensFromLoginTokenInput: GetAuthTokensFromLoginTokenInput,
    @OriginHeader() origin: string,
  ): Promise<AuthTokens> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    const { sub: email, workspaceId } =
      await this.loginTokenService.verifyLoginToken(
        getAuthTokensFromLoginTokenInput.loginToken,
      );

    if (workspaceId !== workspace.id) {
      throw new AuthException(
        'Token is not valid for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return await this.authService.verify(email, workspace.id);
  }

  @Mutation(() => AuthorizeApp)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async authorizeApp(
    @Args() authorizeAppInput: AuthorizeAppInput,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AuthorizeApp> {
    return await this.authService.generateAuthorizationCode(
      authorizeAppInput,
      user,
      workspace,
    );
  }

  @Mutation(() => AuthTokens)
  async renewToken(@Args() args: AppTokenInput): Promise<AuthTokens> {
    const tokens = await this.renewTokenService.generateTokensFromRefreshToken(
      args.appToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => ApiKeyToken)
  async generateApiKeyToken(
    @Args() args: ApiKeyTokenInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ApiKeyToken | undefined> {
    return await this.apiKeyService.generateApiKeyToken(
      workspaceId,
      args.apiKeyId,
      args.expiresAt,
    );
  }

  @Mutation(() => EmailPasswordResetLink)
  async emailPasswordResetLink(
    @Args() emailPasswordResetInput: EmailPasswordResetLinkInput,
    @Context() context: I18nContext,
  ): Promise<EmailPasswordResetLink> {
    const resetToken =
      await this.resetPasswordService.generatePasswordResetToken(
        emailPasswordResetInput.email,
      );

    return await this.resetPasswordService.sendEmailPasswordResetLink(
      resetToken,
      emailPasswordResetInput.email,
      context.req.headers['x-locale'] || SOURCE_LOCALE,
    );
  }

  @Mutation(() => InvalidatePassword)
  async updatePasswordViaResetToken(
    @Args()
    { passwordResetToken, newPassword }: UpdatePasswordViaResetTokenInput,
    @Context() context: I18nContext,
  ): Promise<InvalidatePassword> {
    const { id } =
      await this.resetPasswordService.validatePasswordResetToken(
        passwordResetToken,
      );

    await this.authService.updatePassword(
      id,
      newPassword,
      context.req.headers['x-locale'] || SOURCE_LOCALE,
    );

    return await this.resetPasswordService.invalidatePasswordResetToken(id);
  }

  @Query(() => ValidatePasswordResetToken)
  async validatePasswordResetToken(
    @Args() args: ValidatePasswordResetTokenInput,
  ): Promise<ValidatePasswordResetToken> {
    return this.resetPasswordService.validatePasswordResetToken(
      args.passwordResetToken,
    );
  }

  @Query(() => [AvailableWorkspaceOutput])
  async findAvailableWorkspacesByEmail(
    @Args('email') email: string,
  ): Promise<AvailableWorkspaceOutput[]> {
    return this.userWorkspaceService.findAvailableWorkspacesByEmail(email);
  }
}
