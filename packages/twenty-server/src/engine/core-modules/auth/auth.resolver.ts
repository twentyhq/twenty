import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import omit from 'lodash.omit';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ApiKeyTokenInput } from 'src/engine/core-modules/auth/dto/api-key-token.input';
import { AppTokenInput } from 'src/engine/core-modules/auth/dto/app-token.input';
import { AuthorizeAppOutput } from 'src/engine/core-modules/auth/dto/authorize-app.dto';
import { AuthorizeAppInput } from 'src/engine/core-modules/auth/dto/authorize-app.input';
import { EmailPasswordResetLinkOutput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.dto';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { InvalidatePasswordOutput } from 'src/engine/core-modules/auth/dto/invalidate-password.dto';
import { TransientTokenOutput } from 'src/engine/core-modules/auth/dto/transient-token.dto';
import { UpdatePasswordViaResetTokenInput } from 'src/engine/core-modules/auth/dto/update-password-via-reset-token.input';
import { ValidatePasswordResetTokenOutput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.dto';
import { ValidatePasswordResetTokenInput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
// import { OAuthService } from 'src/engine/core-modules/auth/services/oauth.service';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { MONITORING_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/monitoring/monitoring';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspacesAndAccessTokensOutput } from 'src/engine/core-modules/auth/dto/available-workspaces-and-access-tokens.output';
import { GetAuthTokenFromEmailVerificationTokenInput } from 'src/engine/core-modules/auth/dto/get-auth-token-from-email-verification-token.input';
import { GetAuthorizationUrlForSSOInput } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.input';
import { GetAuthorizationUrlForSSOOutput } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.output';
import { SignUpOutput } from 'src/engine/core-modules/auth/dto/sign-up.output';
import { VerifyEmailAndGetLoginTokenOutput } from 'src/engine/core-modules/auth/dto/verify-email-and-get-login-token.output';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { EmailVerificationTokenService } from 'src/engine/core-modules/auth/token/services/email-verification-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import {
  JwtTokenTypeEnum,
  LoginTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { CaptchaGraphqlApiExceptionFilter } from 'src/engine/core-modules/captcha/filters/captcha-graphql-api-exception.filter';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import { EmailVerificationTrigger } from 'src/engine/core-modules/email-verification/email-verification.constants';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwoFactorAuthenticationVerificationInput } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-verification.input';
import { TwoFactorAuthenticationExceptionFilter } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication-exception.filter';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthProvider } from 'src/engine/decorators/auth/auth-provider.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

import { ApiKeyToken } from './dto/api-key-token.dto';
import { AuthTokens } from './dto/auth-tokens.dto';
import { GetAuthTokensFromLoginTokenInput } from './dto/get-auth-tokens-from-login-token.input';
import { LoginTokenOutput } from './dto/login-token.dto';
import { SignUpInput } from './dto/sign-up.input';
import { UserCredentialsInput } from './dto/user-credentials.input';
import { CheckUserExistOutput } from './dto/user-exists.dto';
import { EmailAndCaptchaInput } from './dto/user-exists.input';
import { WorkspaceInviteHashValidOutput } from './dto/workspace-invite-hash-valid.dto';
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
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
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
    private workspaceDomainsService: WorkspaceDomainsService,
    private userWorkspaceService: UserWorkspaceService,
    private emailVerificationTokenService: EmailVerificationTokenService,
    private sSOService: SSOService,
    private readonly auditService: AuditService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
  @Query(() => CheckUserExistOutput)
  async checkUserExists(
    @Args() checkUserExistsInput: EmailAndCaptchaInput,
  ): Promise<CheckUserExistOutput> {
    return await this.authService.checkUserExists(
      checkUserExistsInput.email.toLowerCase(),
    );
  }

  @Mutation(() => GetAuthorizationUrlForSSOOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getAuthorizationUrlForSSO(
    @Args('input') params: GetAuthorizationUrlForSSOInput,
  ) {
    return await this.sSOService.getAuthorizationUrlForSSO(
      params.identityProviderId,
      omit(params, ['identityProviderId']),
    );
  }

  @Query(() => WorkspaceInviteHashValidOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async checkWorkspaceInviteHashIsValid(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceInviteHashValidOutput> {
    return await this.authService.checkWorkspaceInviteHashIsValid(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Query(() => WorkspaceEntity)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async findWorkspaceFromInviteHash(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceEntity> {
    return await this.authService.findWorkspaceFromInviteHashOrFail(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Mutation(() => LoginTokenOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
  async getLoginTokenFromCredentials(
    @Args()
    getLoginTokenFromCredentialsInput: UserCredentialsInput,
    @Args('origin') origin: string,
  ): Promise<LoginTokenOutput> {
    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    assertIsDefinedOrThrow(
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
  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
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

  @Mutation(() => VerifyEmailAndGetLoginTokenOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async verifyEmailAndGetLoginToken(
    @Args()
    getAuthTokenFromEmailVerificationTokenInput: GetAuthTokenFromEmailVerificationTokenInput,
    @Args('origin') origin: string,
    @AuthProvider() authProvider: AuthProviderEnum,
  ) {
    const appToken =
      await this.emailVerificationTokenService.validateEmailVerificationTokenOrThrow(
        getAuthTokenFromEmailVerificationTokenInput,
      );

    if (appToken.context && appToken.context.email !== appToken.user.email) {
      await this.userService.updateEmailFromVerificationToken(
        appToken.user.id,
        appToken.context.email,
      );
    }

    const user = await this.userService.markEmailAsVerified(appToken.user.id);

    await this.appTokenRepository.remove(appToken);

    const workspace =
      (await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      )) ??
      (await this.userWorkspaceService.findFirstWorkspaceByUserId(user.id));

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      authProvider,
    );

    const workspaceUrls =
      this.workspaceDomainsService.getWorkspaceUrls(workspace);

    return { loginToken, workspaceUrls };
  }

  @Mutation(() => AvailableWorkspacesAndAccessTokensOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async verifyEmailAndGetWorkspaceAgnosticToken(
    @Args()
    getAuthTokenFromEmailVerificationTokenInput: GetAuthTokenFromEmailVerificationTokenInput,
    @AuthProvider() authProvider: AuthProviderEnum,
  ) {
    const appToken =
      await this.emailVerificationTokenService.validateEmailVerificationTokenOrThrow(
        getAuthTokenFromEmailVerificationTokenInput,
      );

    if (appToken.context && appToken.context.email !== appToken.user.email) {
      await this.userService.updateEmailFromVerificationToken(
        appToken.user.id,
        appToken.context.email,
      );
    }

    const user = await this.userService.markEmailAsVerified(appToken.user.id);

    await this.appTokenRepository.remove(appToken);

    const availableWorkspaces =
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(
        user.email,
      );

    return {
      availableWorkspaces:
        await this.userWorkspaceService.setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
          availableWorkspaces,
          user,
          authProvider,
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

  @Mutation(() => AuthTokens)
  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
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
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    assertIsDefinedOrThrow(
      workspace,

      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const user = await this.userService.findUserByEmailOrThrow(email);

    await this.twoFactorAuthenticationService.validateStrategy(
      user.id,
      twoFactorAuthenticationVerificationInput.otp,
      workspace.id,
      TwoFactorAuthenticationStrategy.TOTP,
    );

    return await this.authService.verify(email, workspace.id, authProvider);
  }

  @Mutation(() => AvailableWorkspacesAndAccessTokensOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
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

    await this.emailVerificationService.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      workspace: undefined,
      locale: signUpInput.locale ?? SOURCE_LOCALE,
      verifyEmailRedirectPath: signUpInput.verifyEmailRedirectPath,
      verificationTrigger: EmailVerificationTrigger.SIGN_UP,
    });

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
  @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
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

    const existingUser = await this.userService.findUserByEmail(
      signUpInput.email,
    );

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

    await this.emailVerificationService.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      workspace,
      locale: signUpInput.locale ?? SOURCE_LOCALE,
      verifyEmailRedirectPath: signUpInput.verifyEmailRedirectPath,
      verificationTrigger: EmailVerificationTrigger.SIGN_UP,
    });

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      authProvider,
    );

    return {
      loginToken,
      workspace: {
        id: workspace.id,
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(workspace),
      },
    };
  }

  @Mutation(() => SignUpOutput)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async signUpInNewWorkspace(
    @AuthUser() currentUser: UserEntity,
    @AuthProvider() authProvider: AuthProviderEnum,
  ): Promise<SignUpOutput> {
    await this.signInUpService.checkWorkspaceCreationIsAllowedOrThrow(
      currentUser,
    );

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
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(workspace),
      },
    };
  }

  @Mutation(() => TransientTokenOutput)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async generateTransientToken(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TransientTokenOutput | void> {
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
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getAuthTokensFromLoginToken(
    @Args() getAuthTokensFromLoginTokenInput: GetAuthTokensFromLoginTokenInput,
    @Args('origin') origin: string,
  ): Promise<AuthTokens> {
    const tokenPayload = await this.validateAndDecodeLoginToken(
      getAuthTokensFromLoginTokenInput.loginToken,
    );

    const workspace = await this.validateWorkspaceAccess(
      origin,
      tokenPayload.workspaceId,
    );

    const { user, userWorkspace } = await this.validateUserAccess(
      tokenPayload.sub,
      tokenPayload.workspaceId,
    );

    if (tokenPayload.authProvider === AuthProviderEnum.Impersonation) {
      const {
        workspaceId,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId,
        impersonatorUserId,
        impersonatedUserId,
      } = await this.validateAndLogImpersonation(
        tokenPayload,
        workspace,
        user.email,
      );

      return await this.authService.generateImpersonationAccessTokenAndRefreshToken(
        {
          workspaceId,
          impersonatorUserWorkspaceId,
          impersonatedUserWorkspaceId,
          impersonatorUserId,
          impersonatedUserId,
        },
      );
    } else {
      await this.validateRegularAuthentication(workspace, userWorkspace);

      return await this.authService.verify(
        user.email,
        workspace.id,
        tokenPayload.authProvider,
      );
    }
  }

  private async validateAndDecodeLoginToken(
    loginToken: string,
  ): Promise<LoginTokenJwtPayload> {
    return await this.loginTokenService.verifyLoginToken(loginToken);
  }

  private async validateWorkspaceAccess(
    origin: string,
    tokenWorkspaceId: string,
  ): Promise<WorkspaceEntity> {
    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    if (tokenWorkspaceId !== workspace.id) {
      throw new AuthException(
        'Token is not valid for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return workspace;
  }

  private async validateUserAccess(
    email: string,
    workspaceId: string,
  ): Promise<{ user: UserEntity; userWorkspace: UserWorkspaceEntity }> {
    const user = await this.userService.findUserByEmailOrThrow(email);

    await this.authService.checkIsEmailVerified(user.isEmailVerified);

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: user.id,
        workspaceId,
      });

    return { user, userWorkspace };
  }

  private async validateRegularAuthentication(
    workspace: WorkspaceEntity,
    userWorkspace: UserWorkspaceEntity,
  ): Promise<void> {
    await this.twoFactorAuthenticationService.validateTwoFactorAuthenticationRequirement(
      workspace,
      userWorkspace.twoFactorAuthenticationMethods,
    );
  }

  private async validateAndLogImpersonation(
    tokenPayload: LoginTokenJwtPayload,
    workspace: WorkspaceEntity,
    targetUserEmail: string,
  ) {
    const { impersonatorUserWorkspaceId } = tokenPayload;

    const impersonatorUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: impersonatorUserWorkspaceId },
        relations: ['user', 'workspace'],
      });

    const toImpersonateUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: {
          user: { email: targetUserEmail },
          workspaceId: workspace.id,
        },
        relations: ['user', 'workspace'],
      });

    if (
      !isDefined(impersonatorUserWorkspace) ||
      !isDefined(toImpersonateUserWorkspace)
    ) {
      throw new AuthException(
        'Impersonator or target user workspace not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const isServerLevelImpersonation =
      toImpersonateUserWorkspace.workspace.id !==
      impersonatorUserWorkspace.workspace.id;

    const auditService = this.auditService.createContext({
      workspaceId: workspace.id,
      userId: impersonatorUserWorkspace.user.id,
    });

    auditService.insertWorkspaceEvent(MONITORING_EVENT, {
      eventName: `${isServerLevelImpersonation ? 'server' : 'workspace'}.impersonation.token_exchange_attempt`,
      message: `Impersonation token exchange attempt for ${targetUserEmail} by ${impersonatorUserWorkspace.user.id}`,
    });

    const hasServerLevelImpersonatePermission =
      impersonatorUserWorkspace.user.canImpersonate === true &&
      toImpersonateUserWorkspace.workspace.allowImpersonation === true;

    if (isServerLevelImpersonation) {
      if (!hasServerLevelImpersonatePermission) {
        auditService.insertWorkspaceEvent(MONITORING_EVENT, {
          eventName: 'server.impersonation.token_exchange_failed',
          message: `Server level impersonation not allowed for ${targetUserEmail} by userId ${impersonatorUserWorkspace.user.id}`,
        });

        throw new AuthException(
          'Server level impersonation not allowed on this workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `server.impersonation.token_exchange_success`,
        message: `Impersonation token exchanged for ${targetUserEmail} by userId ${impersonatorUserWorkspace.user.id}`,
      });

      return {
        workspaceId: workspace.id,
        impersonatorUserWorkspaceId: impersonatorUserWorkspace.id,
        impersonatedUserWorkspaceId: toImpersonateUserWorkspace.id,
        impersonatorUserId: impersonatorUserWorkspace.user.id,
        impersonatedUserId: toImpersonateUserWorkspace.user.id,
      };
    }

    const hasWorkspaceLevelImpersonatePermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: impersonatorUserWorkspace.id,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId: workspace.id,
      });

    if (!hasWorkspaceLevelImpersonatePermission) {
      auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: 'workspace.impersonation.token_exchange_failed',
        message: `Impersonation not allowed for ${targetUserEmail} by userId ${impersonatorUserWorkspace.user.id}`,
      });
      throw new AuthException(
        'Impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    auditService.insertWorkspaceEvent(MONITORING_EVENT, {
      eventName: 'workspace.impersonation.token_exchange_success',
      message: `Impersonation token exchanged for ${targetUserEmail} by userId ${impersonatorUserWorkspace.user.id}`,
    });

    return {
      workspaceId: workspace.id,
      impersonatorUserWorkspaceId: impersonatorUserWorkspace.id,
      impersonatedUserWorkspaceId: toImpersonateUserWorkspace.id,
      impersonatorUserId: impersonatorUserWorkspace.user.id,
      impersonatedUserId: toImpersonateUserWorkspace.user.id,
    };
  }

  @Mutation(() => AuthorizeAppOutput)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async authorizeApp(
    @Args() authorizeAppInput: AuthorizeAppInput,
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AuthorizeAppOutput> {
    return await this.authService.generateAuthorizationCode(
      authorizeAppInput,
      user,
      workspace,
    );
  }

  @Mutation(() => AuthTokens)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async renewToken(@Args() args: AppTokenInput): Promise<AuthTokens> {
    const tokens = await this.renewTokenService.generateTokensFromRefreshToken(
      args.appToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
  )
  @Mutation(() => ApiKeyToken)
  async generateApiKeyToken(
    @Args() args: ApiKeyTokenInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApiKeyToken | undefined> {
    return await this.apiKeyService.generateApiKeyToken(
      workspaceId,
      args.apiKeyId,
      args.expiresAt,
    );
  }

  @Mutation(() => EmailPasswordResetLinkOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async emailPasswordResetLink(
    @Args() emailPasswordResetInput: EmailPasswordResetLinkInput,
    @Context() context: I18nContext,
  ): Promise<EmailPasswordResetLinkOutput> {
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

  @Mutation(() => InvalidatePasswordOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async updatePasswordViaResetToken(
    @Args()
    { passwordResetToken, newPassword }: UpdatePasswordViaResetTokenInput,
  ): Promise<InvalidatePasswordOutput> {
    const { id } =
      await this.resetPasswordService.validatePasswordResetToken(
        passwordResetToken,
      );

    await this.authService.updatePassword(id, newPassword);

    return await this.resetPasswordService.invalidatePasswordResetToken(id);
  }

  @Query(() => ValidatePasswordResetTokenOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async validatePasswordResetToken(
    @Args() args: ValidatePasswordResetTokenInput,
  ): Promise<ValidatePasswordResetTokenOutput> {
    return this.resetPasswordService.validatePasswordResetToken(
      args.passwordResetToken,
    );
  }
}
