import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  runGuardedQuery,
  runGuardedRestRequest,
} from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

const user = { id: 'user-id' };
const workspace = { id: 'workspace-id' };
const oauthClient = {
  id: 'oauth-client-id',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
};
const installedApplication = {
  id: 'application-id',
  sourceType: ApplicationRegistrationSourceType.NPM,
};

const REQUEST_BY_PRINCIPAL_VARIANT = {
  'userSession.standard': {
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.ACCESS,
  },
  'userSession.impersonated': {
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.ACCESS,
    impersonationContext: {
      impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
      impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
    },
  },
  'userSession.playground': {
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.PLAYGROUND,
  },
  'userSession.workspaceAgnostic': {
    user,
    tokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
  },
  apiKey: {
    apiKey: { id: 'api-key-id' },
    workspace,
    tokenType: JwtTokenTypeEnum.API_KEY,
  },
  'oauthClient.withUser': {
    application: oauthClient,
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  'oauthClient.withoutUser': {
    application: oauthClient,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  'application.withUser': {
    application: installedApplication,
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  'application.withoutUser': {
    application: installedApplication,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
};

type PrincipalVariantName = keyof typeof REQUEST_BY_PRINCIPAL_VARIANT;

const ALL_PRINCIPAL_VARIANT_NAMES = Object.keys(
  REQUEST_BY_PRINCIPAL_VARIANT,
) as PrincipalVariantName[];

const REFUSE_EVERY_PRINCIPAL: AuthPrincipalGuardConfig = {
  userSession: false,
  apiKey: false,
  oauthClient: false,
  application: false,
};

const ACCEPT_EVERY_PRINCIPAL: AuthPrincipalGuardConfig = {
  userSession: true,
  apiKey: true,
  oauthClient: true,
  application: true,
};

const CONFIG_CASES: {
  name: string;
  authPrincipalGuardConfig: AuthPrincipalGuardConfig;
  acceptedPrincipalVariantNames: PrincipalVariantName[];
}[] = [
  {
    name: 'every kind refused',
    authPrincipalGuardConfig: REFUSE_EVERY_PRINCIPAL,
    acceptedPrincipalVariantNames: [],
  },
  {
    name: 'every kind accepted',
    authPrincipalGuardConfig: ACCEPT_EVERY_PRINCIPAL,
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES,
  },
  {
    name: 'userSession: true',
    authPrincipalGuardConfig: { ...REFUSE_EVERY_PRINCIPAL, userSession: true },
    acceptedPrincipalVariantNames: [
      'userSession.standard',
      'userSession.impersonated',
      'userSession.playground',
      'userSession.workspaceAgnostic',
    ],
  },
  {
    name: 'userSession: false',
    authPrincipalGuardConfig: { ...ACCEPT_EVERY_PRINCIPAL, userSession: false },
    acceptedPrincipalVariantNames: [
      'apiKey',
      'oauthClient.withUser',
      'oauthClient.withoutUser',
      'application.withUser',
      'application.withoutUser',
    ],
  },
  {
    name: 'userSession standard only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      userSession: {
        standard: true,
        impersonated: false,
        playground: false,
        workspaceAgnostic: false,
      },
    },
    acceptedPrincipalVariantNames: ['userSession.standard'],
  },
  {
    name: 'userSession impersonated only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      userSession: {
        standard: false,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
    },
    acceptedPrincipalVariantNames: ['userSession.impersonated'],
  },
  {
    name: 'userSession playground only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      userSession: {
        standard: false,
        impersonated: false,
        playground: true,
        workspaceAgnostic: false,
      },
    },
    acceptedPrincipalVariantNames: ['userSession.playground'],
  },
  {
    name: 'userSession workspaceAgnostic only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      userSession: {
        standard: false,
        impersonated: false,
        playground: false,
        workspaceAgnostic: true,
      },
    },
    acceptedPrincipalVariantNames: ['userSession.workspaceAgnostic'],
  },
  {
    name: 'apiKey: true',
    authPrincipalGuardConfig: { ...REFUSE_EVERY_PRINCIPAL, apiKey: true },
    acceptedPrincipalVariantNames: ['apiKey'],
  },
  {
    name: 'apiKey: false',
    authPrincipalGuardConfig: { ...ACCEPT_EVERY_PRINCIPAL, apiKey: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => principalVariantName !== 'apiKey',
    ),
  },
  {
    name: 'oauthClient: true',
    authPrincipalGuardConfig: { ...REFUSE_EVERY_PRINCIPAL, oauthClient: true },
    acceptedPrincipalVariantNames: [
      'oauthClient.withUser',
      'oauthClient.withoutUser',
    ],
  },
  {
    name: 'oauthClient: false',
    authPrincipalGuardConfig: { ...ACCEPT_EVERY_PRINCIPAL, oauthClient: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => !principalVariantName.startsWith('oauthClient'),
    ),
  },
  {
    name: 'oauthClient withUser only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      oauthClient: { withUser: true, withoutUser: false },
    },
    acceptedPrincipalVariantNames: ['oauthClient.withUser'],
  },
  {
    name: 'oauthClient withoutUser only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      oauthClient: { withUser: false, withoutUser: true },
    },
    acceptedPrincipalVariantNames: ['oauthClient.withoutUser'],
  },
  {
    name: 'application: true',
    authPrincipalGuardConfig: { ...REFUSE_EVERY_PRINCIPAL, application: true },
    acceptedPrincipalVariantNames: [
      'application.withUser',
      'application.withoutUser',
    ],
  },
  {
    name: 'application: false',
    authPrincipalGuardConfig: { ...ACCEPT_EVERY_PRINCIPAL, application: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => !principalVariantName.startsWith('application'),
    ),
  },
  {
    name: 'application withUser only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      application: { withUser: true, withoutUser: false },
    },
    acceptedPrincipalVariantNames: ['application.withUser'],
  },
  {
    name: 'application withoutUser only',
    authPrincipalGuardConfig: {
      ...REFUSE_EVERY_PRINCIPAL,
      application: { withUser: false, withoutUser: true },
    },
    acceptedPrincipalVariantNames: ['application.withoutUser'],
  },
  {
    name: 'every principal carrying a user',
    authPrincipalGuardConfig: {
      userSession: true,
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: { withUser: true, withoutUser: false },
    },
    acceptedPrincipalVariantNames: [
      'userSession.standard',
      'userSession.impersonated',
      'userSession.playground',
      'userSession.workspaceAgnostic',
      'oauthClient.withUser',
      'application.withUser',
    ],
  },
  {
    name: 'workspace sessions that are not impersonated',
    authPrincipalGuardConfig: {
      userSession: {
        standard: true,
        impersonated: false,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    acceptedPrincipalVariantNames: [
      'userSession.standard',
      'userSession.playground',
    ],
  },
];

const buildHttpContext = (request: unknown): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const canActivateOverHttp = (
  authPrincipalGuardConfig: AuthPrincipalGuardConfig,
  request: unknown,
): boolean => {
  const Guard = AuthPrincipalGuard(authPrincipalGuardConfig);

  try {
    return new Guard().canActivate(buildHttpContext(request)) as boolean;
  } catch (error) {
    if (error instanceof ForbiddenException) {
      return false;
    }

    throw error;
  }
};

describe('AuthPrincipalGuard', () => {
  describe.each(CONFIG_CASES)(
    'with $name',
    ({ authPrincipalGuardConfig, acceptedPrincipalVariantNames }) => {
      it.each(
        ALL_PRINCIPAL_VARIANT_NAMES.map((principalVariantName) => ({
          principalVariantName,
          decision: acceptedPrincipalVariantNames.includes(principalVariantName)
            ? 'accept'
            : 'refuse',
        })),
      )(
        'should $decision $principalVariantName',
        ({ principalVariantName, decision }) => {
          expect(
            canActivateOverHttp(
              authPrincipalGuardConfig,
              REQUEST_BY_PRINCIPAL_VARIANT[principalVariantName],
            ),
          ).toBe(decision === 'accept');
        },
      );
    },
  );

  it.each([
    {
      name: 'a token type that is not a session',
      tokenType: JwtTokenTypeEnum.FILE,
    },
    { name: 'a token type that never resolved', tokenType: undefined },
  ])('should refuse a user carried by $name', ({ tokenType }) => {
    expect(
      canActivateOverHttp(ACCEPT_EVERY_PRINCIPAL, {
        user,
        workspace,
        tokenType,
      }),
    ).toBe(false);
  });

  it('should treat a session as impersonated only when both ids are set', () => {
    expect(
      canActivateOverHttp(
        {
          ...REFUSE_EVERY_PRINCIPAL,
          userSession: {
            standard: true,
            impersonated: false,
            playground: false,
            workspaceAgnostic: false,
          },
        },
        {
          user,
          workspace,
          tokenType: JwtTokenTypeEnum.ACCESS,
          impersonationContext: {
            impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
          },
        },
      ),
    ).toBe(true);
  });

  it('should refuse when there is no request on the context', () => {
    expect(canActivateOverHttp(ACCEPT_EVERY_PRINCIPAL, undefined)).toBe(false);
  });

  describe('over GraphQL', () => {
    it('should let an accepted principal through', async () => {
      const result = await runGuardedQuery({
        guard: AuthPrincipalGuard({
          ...REFUSE_EVERY_PRINCIPAL,
          userSession: true,
        }),
        request: REQUEST_BY_PRINCIPAL_VARIANT['userSession.standard'],
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.guardedQuery).toBe('ok');
    });

    it('should refuse with FORBIDDEN', async () => {
      const result = await runGuardedQuery({
        guard: AuthPrincipalGuard({
          ...REFUSE_EVERY_PRINCIPAL,
          userSession: true,
        }),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
      expect(result.errors?.[0]?.originalError).toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should report a request without credentials as UNAUTHENTICATED', async () => {
      const result = await runGuardedQuery({
        guard: AuthPrincipalGuard(ACCEPT_EVERY_PRINCIPAL),
        request: { workspace },
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.UNAUTHENTICATED,
      );
    });
  });

  describe('over REST', () => {
    it('should let an accepted principal through', async () => {
      const response = await runGuardedRestRequest({
        guard: AuthPrincipalGuard({ ...REFUSE_EVERY_PRINCIPAL, apiKey: true }),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
      });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
    });

    it('should refuse with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: AuthPrincipalGuard({
          ...REFUSE_EVERY_PRINCIPAL,
          userSession: true,
        }),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
    });

    it('should refuse a request without credentials with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: AuthPrincipalGuard(ACCEPT_EVERY_PRINCIPAL),
        request: {},
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
    });
  });
});
