import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import omit from 'lodash.omit';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
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
// import { OAuthService } from 'src/engine/core-modules/auth/services/oauth.service';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspacesAndAccessTokensOutput } from 'src/engine/core-modules/auth/dto/available-workspaces-and-access-tokens.output';
import { GetAuthTokenFromEmailVerificationTokenInput } from 'src/engine/core-modules/auth/dto/get-auth-token-from-email-verification-token.input';
import { GetAuthorizationUrlForSSOInput } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.input';
import { GetAuthorizationUrlForSSOOutput } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.output';
import { GetLoginTokenFromEmailVerificationTokenOutput } from 'src/engine/core-modules/auth/dto/get-login-token-from-email-verification-token.output';
import { SignUpOutput } from 'src/engine/core-modules/auth/dto/sign-up.output';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { EmailVerificationTokenService } from 'src/engine/core-modules/auth/token/services/email-verification-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { CaptchaGraphqlApiExceptionFilter } from 'src/engine/core-modules/captcha/filters/captcha-graphql-api-exception.filter';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwoFactorAuthenticationVerificationInput } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-verification.input';
import { TwoFactorAuthenticationExceptionFilter } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication-exception.filter';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthProvider } from 'src/engine/decorators/auth/auth-provider.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

import { GetAuthTokensFromLoginTokenInput } from './dto/get-auth-tokens-from-login-token.input';
import { LoginToken } from './dto/login-token.entity';
import { SignUpInput } from './dto/sign-up.input';
import { ApiKeyToken, AuthTokens } from './dto/token.entity';
import { UserCredentialsInput } from './dto/user-credentials.input';
import { CheckUserExistOutput } from './dto/user-exists.entity';
import { EmailAndCaptchaInput } from './dto/user-exists.input';
import { WorkspaceInviteHashValid } from './dto/workspace-invite-hash-valid.entity';
import { WorkspaceInviteHashValidInput } from './dto/workspace-invite-hash.input';
import { AuthService } from './services/auth.service';

@UsePipes(ResolverValidationPipe)
@Resolver()
@UseFilters(
  CaptchaGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  EmailVerificationExceptionFilter,
  TwoFactorAuthenticationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AuthResolver {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private authService: AuthService,
    private renewTokenService: RenewTokenService,
    private userService: UserService,
    private apiKeyService: ApiKeyService,
    private resetPasswordService: ResetPasswordService,
    private loginTokenService: LoginTokenService,
    private workspaceAgnosticTokenService: WorkspaceAgnosticTokenService,
    private refreshTokenService: RefreshTokenService,
    private signInUpService: SignInUpService,
    private transientTokenService: TransientTokenService,
    private emailVerificationService: EmailVerificationService,
    // private oauthService: OAuthService,
    private domainManagerService: DomainManagerService,
    private userWorkspaceService: UserWorkspaceService,
    private emailVerificationTokenService: EmailVerificationTokenService,
    private sSOService: SSOService,
  ) {}

  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  @Query(() => CheckUserExistOutput)
  async checkUserExists(
    @Args() checkUserExistsInput: EmailAndCaptchaInput,
  ): Promise<CheckUserExistOutput> {
    return await this.authService.checkUserExists(
      checkUserExistsInput.email.toLowerCase(),
    );
  }

  @Mutation(() => GetAuthorizationUrlForSSOOutput)
  @UseGuards(PublicEndpointGuard)
  async getAuthorizationUrlForSSO(
    @Args('input') params: GetAuthorizationUrlForSSOInput,
  ) {
    return await this.sSOService.getAuthorizationUrlForSSO(
      params.identityProviderId,
      omit(params, ['identityProviderId']),
    );
  }

  @Query(() => WorkspaceInviteHashValid)
  @UseGuards(PublicEndpointGuard)
  async checkWorkspaceInviteHashIsValid(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceInviteHashValid> {
    return await this.authService.checkWorkspaceInviteHashIsValid(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Query(() => Workspace)
  @UseGuards(PublicEndpointGuard)
  async findWorkspaceFromInviteHash(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<Workspace> {
    return await this.authService.findWorkspaceFromInviteHashOrFail(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Mutation(() => LoginToken)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async getLoginTokenFromCredentials(
    @Args()
    getLoginTokenFromCredentialsInput: UserCredentialsInput,
    @Args('origin') origin: string,
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

    const user = await this.authService.validateLoginWithPassword(
      getLoginTokenFromCredentialsInput,
      workspace,
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      // email validation is active only for password flow
      AuthProviderEnum.Password,
    );

    return { loginToken };
  }

  @Mutation(() => AvailableWorkspacesAndAccessTokensOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async signIn(
    @Args()
    userCredentials: UserCredentialsInput,
  ): Promise<AvailableWorkspacesAndAccessTokensOutput> {
    const user =
      await this.authService.validateLoginWithPassword(userCredentials);

    const availableWorkspaces =
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(
        user.email,
      );

    return {
      availableWorkspaces:
        await this.userWorkspaceService.setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
          availableWorkspaces,
          user,
          AuthProviderEnum.Password,
        ),
      tokens: {
        accessOrWorkspaceAgnosticToken:
          await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
            {
              userId: user.id,
              authProvider: AuthProviderEnum.Password,
            },
          ),
        refreshToken: await this.refreshTokenService.generateRefreshToken({
          userId: user.id,
          authProvider: AuthProviderEnum.Password,
          targetedTokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        }),
      },
    };
  }

  @Mutation(() => GetLoginTokenFromEmailVerificationTokenOutput)
  @UseGuards(PublicEndpointGuard)
  async getLoginTokenFromEmailVerificationToken(
    @Args()
    getAuthTokenFromEmailVerificationTokenInput: GetAuthTokenFromEmailVerificationTokenInput,
    @Args('origin') origin: string,
    @AuthProvider() authProvider: AuthProviderEnum,
  ) {
    const appToken =
      await this.emailVerificationTokenService.validateEmailVerificationTokenOrThrow(
        getAuthTokenFromEmailVerificationTokenInput,
      );

    const workspace =
      (await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      )) ??
      (await this.userWorkspaceService.findFirstWorkspaceByUserId(
        appToken.user.id,
      ));

    await this.userService.markEmailAsVerified(appToken.user.id);
    await this.appTokenRepository.remove(appToken);

    const loginToken = await this.loginTokenService.generateLoginToken(
      appToken.user.email,
      workspace.id,
      authProvider,
    );

    const workspaceUrls = this.domainManagerService.getWorkspaceUrls(workspace);

    return { loginToken, workspaceUrls };
  }

  @Mutation(() => AvailableWorkspacesAndAccessTokensOutput)
  @UseGuards(PublicEndpointGuard)
  async getWorkspaceAgnosticTokenFromEmailVerificationToken(
    @Args()
    getAuthTokenFromEmailVerificationTokenInput: GetAuthTokenFromEmailVerificationTokenInput,
    @AuthProvider() authProvider: AuthProviderEnum,
  ) {
    const appToken =
      await this.emailVerificationTokenService.validateEmailVerificationTokenOrThrow(
        getAuthTokenFromEmailVerificationTokenInput,
      );

    await this.userService.markEmailAsVerified(appToken.user.id);
    await this.appTokenRepository.remove(appToken);

    const availableWorkspaces =
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(
        appToken.user.email,
      );

    return {
      availableWorkspaces:
        await this.userWorkspaceService.setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
          availableWorkspaces,
          appToken.user,
          authProvider,
        ),
      tokens: {
        accessOrWorkspaceAgnosticToken:
          await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
            {
              userId: appToken.user.id,
              authProvider: AuthProviderEnum.Password,
            },
          ),
        refreshToken: await this.refreshTokenService.generateRefreshToken({
          userId: appToken.user.id,
          authProvider: AuthProviderEnum.Password,
          targetedTokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        }),
      },
    };
  }

  @Mutation(() => AuthTokens)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async getAuthTokensFromOTP(
    @Args()
    twoFactorAuthenticationVerificationInput: TwoFactorAuthenticationVerificationInput,
    @Args('origin') origin: string,
  ): Promise<AuthTokens> {
    const { sub: email, authProvider } =
      await this.loginTokenService.verifyLoginToken(
        twoFactorAuthenticationVerificationInput.loginToken,
      );

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

    const user = await this.userService.getUserByEmail(email);

    await this.twoFactorAuthenticationService.validateStrategy(
      user.id,
      twoFactorAuthenticationVerificationInput.otp,
      workspace.id,
      TwoFactorAuthenticationStrategy.TOTP,
    );

    return await this.authService.verify(email, workspace.id, authProvider);
  }

  @Mutation(() => AvailableWorkspacesAndAccessTokensOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async signUp(
    @Args() signUpInput: UserCredentialsInput,
  ): Promise<AvailableWorkspacesAndAccessTokensOutput> {
    const user = await this.signInUpService.signUpWithoutWorkspace(
      {
        email: signUpInput.email,
      },
      {
        provider: AuthProviderEnum.Password,
        password: signUpInput.password,
      },
    );

    const availableWorkspaces =
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(
        user.email,
      );

    await this.emailVerificationService.sendVerificationEmail(
      user.id,
      user.email,
      undefined,
      signUpInput.locale ?? SOURCE_LOCALE,
      signUpInput.verifyEmailRedirectPath,
    );

    return {
      availableWorkspaces:
        await this.userWorkspaceService.setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
          availableWorkspaces,
          user,
          AuthProviderEnum.Password,
        ),
      tokens: {
        accessOrWorkspaceAgnosticToken:
          await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
            {
              userId: user.id,
              authProvider: AuthProviderEnum.Password,
            },
          ),
        refreshToken: await this.refreshTokenService.generateRefreshToken({
          userId: user.id,
          authProvider: AuthProviderEnum.Password,
          targetedTokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        }),
      },
    };
  }

  @Mutation(() => SignUpOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async signUpInWorkspace(
    @Args() signUpInput: SignUpInput,
    @AuthProvider() authProvider: AuthProviderEnum,
  ): Promise<SignUpOutput> {
    const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
      workspaceInviteHash: signUpInput.workspaceInviteHash,
      authProvider: AuthProviderEnum.Password,
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
        provider: AuthProviderEnum.Password,
        password: signUpInput.password,
      },
    });

    await this.emailVerificationService.sendVerificationEmail(
      user.id,
      user.email,
      workspace,
      signUpInput.locale ?? SOURCE_LOCALE,
      signUpInput.verifyEmailRedirectPath,
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      authProvider,
    );

    return {
      loginToken,
      workspace: {
        id: workspace.id,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
      },
    };
  }

  @Mutation(() => SignUpOutput)
  @UseGuards(UserAuthGuard)
  async signUpInNewWorkspace(
    @AuthUser() currentUser: User,
    @AuthProvider() authProvider: AuthProviderEnum,
  ): Promise<SignUpOutput> {
    const { user, workspace } = await this.signInUpService.signUpOnNewWorkspace(
      { type: 'existingUser', existingUser: currentUser },
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      authProvider,
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
  @UseGuards(UserAuthGuard)
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
      await this.transientTokenService.generateTransientToken({
        workspaceId: workspace.id,
        userId: user.id,
        workspaceMemberId: workspaceMember.id,
      });

    return { transientToken };
  }

  @Mutation(() => AuthTokens)
  @UseGuards(PublicEndpointGuard)
  async getAuthTokensFromLoginToken(
    @Args() getAuthTokensFromLoginTokenInput: GetAuthTokensFromLoginTokenInput,
    @Args('origin') origin: string,
  ): Promise<AuthTokens> {
    const {
      sub: email,
      workspaceId,
      authProvider,
    } = await this.loginTokenService.verifyLoginToken(
      getAuthTokensFromLoginTokenInput.loginToken,
    );

    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    if (workspaceId !== workspace.id) {
      throw new AuthException(
        'Token is not valid for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userService.getUserByEmail(email);

    await this.authService.checkIsEmailVerified(user.isEmailVerified);

    const currentUserWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: user.id,
        workspaceId,
      });

    await this.twoFactorAuthenticationService.validateTwoFactorAuthenticationRequirement(
      workspace,
      currentUserWorkspace.twoFactorAuthenticationMethods,
    );

    return await this.authService.verify(email, workspace.id, authProvider);
  }

  @Mutation(() => AuthorizeApp)
  @UseGuards(UserAuthGuard)
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
  @UseGuards(PublicEndpointGuard)
  async renewToken(@Args() args: AppTokenInput): Promise<AuthTokens> {
    const tokens = await this.renewTokenService.generateTokensFromRefreshToken(
      args.appToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
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
  @UseGuards(PublicEndpointGuard)
  async emailPasswordResetLink(
    @Args() emailPasswordResetInput: EmailPasswordResetLinkInput,
    @Context() context: I18nContext,
  ): Promise<EmailPasswordResetLink> {
    const resetToken =
      await this.resetPasswordService.generatePasswordResetToken(
        emailPasswordResetInput.email,
        emailPasswordResetInput.workspaceId,
      );

    return await this.resetPasswordService.sendEmailPasswordResetLink(
      resetToken,
      emailPasswordResetInput.email,
      context.req.locale,
    );
  }

  @Mutation(() => InvalidatePassword)
  @UseGuards(PublicEndpointGuard)
  async updatePasswordViaResetToken(
    @Args()
    { passwordResetToken, newPassword }: UpdatePasswordViaResetTokenInput,
  ): Promise<InvalidatePassword> {
    const { id } =
      await this.resetPasswordService.validatePasswordResetToken(
        passwordResetToken,
      );

    await this.authService.updatePassword(id, newPassword);

    return await this.resetPasswordService.invalidatePasswordResetToken(id);
  }

  @Query(() => ValidatePasswordResetToken)
  @UseGuards(PublicEndpointGuard)
  async validatePasswordResetToken(
    @Args() args: ValidatePasswordResetTokenInput,
  ): Promise<ValidatePasswordResetToken> {
    return this.resetPasswordService.validatePasswordResetToken(
      args.passwordResetToken,
    );
  }
}
