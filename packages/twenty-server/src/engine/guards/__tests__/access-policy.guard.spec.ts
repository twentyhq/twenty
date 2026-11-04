import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  runGuardedQuery,
  runGuardedRestRequest,
} from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { AccessPolicyService } from 'src/engine/permissions/access-policy/access-policy.service';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';

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
const apiKey = { id: 'api-key-id' };
const impersonationContext = {
  impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
  impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
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
    impersonationContext,
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
    apiKey,
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

const PRINCIPAL_CASES: {
  name: string;
  authPrincipals: AuthPrincipalGuardConfig;
  acceptedPrincipalVariantNames: PrincipalVariantName[];
}[] = [
  {
    name: 'every kind refused',
    authPrincipals: REFUSE_EVERY_PRINCIPAL,
    acceptedPrincipalVariantNames: [],
  },
  {
    name: 'every kind accepted',
    authPrincipals: ACCEPT_EVERY_PRINCIPAL,
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES,
  },
  {
    name: 'userSession: true',
    authPrincipals: { ...REFUSE_EVERY_PRINCIPAL, userSession: true },
    acceptedPrincipalVariantNames: [
      'userSession.standard',
      'userSession.impersonated',
      'userSession.playground',
      'userSession.workspaceAgnostic',
    ],
  },
  {
    name: 'userSession: false',
    authPrincipals: { ...ACCEPT_EVERY_PRINCIPAL, userSession: false },
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
    authPrincipals: {
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
    authPrincipals: {
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
    authPrincipals: {
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
    authPrincipals: {
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
    authPrincipals: { ...REFUSE_EVERY_PRINCIPAL, apiKey: true },
    acceptedPrincipalVariantNames: ['apiKey'],
  },
  {
    name: 'apiKey: false',
    authPrincipals: { ...ACCEPT_EVERY_PRINCIPAL, apiKey: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => principalVariantName !== 'apiKey',
    ),
  },
  {
    name: 'oauthClient: true',
    authPrincipals: { ...REFUSE_EVERY_PRINCIPAL, oauthClient: true },
    acceptedPrincipalVariantNames: [
      'oauthClient.withUser',
      'oauthClient.withoutUser',
    ],
  },
  {
    name: 'oauthClient: false',
    authPrincipals: { ...ACCEPT_EVERY_PRINCIPAL, oauthClient: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => !principalVariantName.startsWith('oauthClient'),
    ),
  },
  {
    name: 'oauthClient withUser only',
    authPrincipals: {
      ...REFUSE_EVERY_PRINCIPAL,
      oauthClient: { withUser: true, withoutUser: false },
    },
    acceptedPrincipalVariantNames: ['oauthClient.withUser'],
  },
  {
    name: 'oauthClient withoutUser only',
    authPrincipals: {
      ...REFUSE_EVERY_PRINCIPAL,
      oauthClient: { withUser: false, withoutUser: true },
    },
    acceptedPrincipalVariantNames: ['oauthClient.withoutUser'],
  },
  {
    name: 'application: true',
    authPrincipals: { ...REFUSE_EVERY_PRINCIPAL, application: true },
    acceptedPrincipalVariantNames: [
      'application.withUser',
      'application.withoutUser',
    ],
  },
  {
    name: 'application: false',
    authPrincipals: { ...ACCEPT_EVERY_PRINCIPAL, application: false },
    acceptedPrincipalVariantNames: ALL_PRINCIPAL_VARIANT_NAMES.filter(
      (principalVariantName) => !principalVariantName.startsWith('application'),
    ),
  },
  {
    name: 'application withUser only',
    authPrincipals: {
      ...REFUSE_EVERY_PRINCIPAL,
      application: { withUser: true, withoutUser: false },
    },
    acceptedPrincipalVariantNames: ['application.withUser'],
  },
  {
    name: 'application withoutUser only',
    authPrincipals: {
      ...REFUSE_EVERY_PRINCIPAL,
      application: { withUser: false, withoutUser: true },
    },
    acceptedPrincipalVariantNames: ['application.withoutUser'],
  },
  {
    name: 'every principal carrying a user',
    authPrincipals: {
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
    authPrincipals: {
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

const buildAccessPolicyService = (
  permissionsService = {} as PermissionsService,
): AccessPolicyService =>
  new AccessPolicyService(permissionsService, {} as FeatureFlagService);

const buildPrincipalOnlyPolicy = (
  authPrincipals: AuthPrincipalGuardConfig,
): AccessPolicy => ({ authPrincipals, requiredPermissionFlags: [] });

const canActivateOverHttp = async (
  accessPolicy: AccessPolicy,
  request: unknown,
  accessPolicyService = buildAccessPolicyService(),
): Promise<boolean> => {
  const Guard = AccessPolicyGuard(accessPolicy);

  return (await new Guard(accessPolicyService).canActivate(
    buildHttpContext(request),
  )) as boolean;
};

const isAcceptedOverHttp = async (
  authPrincipals: AuthPrincipalGuardConfig,
  request: unknown,
): Promise<boolean> => {
  try {
    return await canActivateOverHttp(
      buildPrincipalOnlyPolicy(authPrincipals),
      request,
    );
  } catch (error) {
    if (error instanceof ForbiddenException) {
      return false;
    }

    throw error;
  }
};

const ACCESS_POLICY_SERVICE_PROVIDER = {
  provide: AccessPolicyService,
  useValue: buildAccessPolicyService(),
};

describe('AccessPolicyGuard', () => {
  describe('principals', () => {
    describe.each(PRINCIPAL_CASES)(
      'with $name',
      ({ authPrincipals, acceptedPrincipalVariantNames }) => {
        it.each(
          ALL_PRINCIPAL_VARIANT_NAMES.map((principalVariantName) => ({
            principalVariantName,
            decision: acceptedPrincipalVariantNames.includes(
              principalVariantName,
            )
              ? 'accept'
              : 'refuse',
          })),
        )(
          'should $decision $principalVariantName',
          async ({ principalVariantName, decision }) => {
            expect(
              await isAcceptedOverHttp(
                authPrincipals,
                REQUEST_BY_PRINCIPAL_VARIANT[principalVariantName],
              ),
            ).toBe(decision === 'accept');
          },
        );
      },
    );

    it.each(['application.withUser', 'application.withoutUser'] as const)(
      'should refuse an %s token bound to an agent unless the endpoint accepts agent tokens',
      async (principalVariantName) => {
        const agentTokenRequest = {
          ...REQUEST_BY_PRINCIPAL_VARIANT[principalVariantName],
          agentId: 'agent-id',
        };

        expect(
          await isAcceptedOverHttp(ACCEPT_EVERY_PRINCIPAL, agentTokenRequest),
        ).toBe(false);
        expect(
          await isAcceptedOverHttp(
            {
              ...ACCEPT_EVERY_PRINCIPAL,
              application: {
                withUser: true,
                withoutUser: true,
                withAgent: true,
              },
            },
            agentTokenRequest,
          ),
        ).toBe(true);
      },
    );

    it('should refuse a token bound to an agent when its user variant is refused', async () => {
      expect(
        await isAcceptedOverHttp(
          {
            ...REFUSE_EVERY_PRINCIPAL,
            application: {
              withUser: false,
              withoutUser: true,
              withAgent: true,
            },
          },
          {
            ...REQUEST_BY_PRINCIPAL_VARIANT['application.withUser'],
            agentId: 'agent-id',
          },
        ),
      ).toBe(false);
    });

    it.each([
      {
        name: 'a token type that is not a session',
        tokenType: JwtTokenTypeEnum.FILE,
      },
      { name: 'a token type that never resolved', tokenType: undefined },
    ])('should refuse a user carried by $name', async ({ tokenType }) => {
      expect(
        await isAcceptedOverHttp(ACCEPT_EVERY_PRINCIPAL, {
          user,
          workspace,
          tokenType,
        }),
      ).toBe(false);
    });

    it.each([
      {
        name: 'an API key token that also carries a user',
        request: {
          apiKey,
          user,
          workspace,
          tokenType: JwtTokenTypeEnum.API_KEY,
        },
      },
      {
        name: 'an API key token that also carries an application',
        request: {
          apiKey,
          application: installedApplication,
          workspace,
          tokenType: JwtTokenTypeEnum.API_KEY,
        },
      },
      {
        name: 'an API key token that also carries an agent',
        request: {
          apiKey,
          agentId: 'agent-id',
          workspace,
          tokenType: JwtTokenTypeEnum.API_KEY,
        },
      },
      {
        name: 'an API key token without an API key',
        request: { workspace, tokenType: JwtTokenTypeEnum.API_KEY },
      },
      {
        name: 'an API key without a token type',
        request: { apiKey, workspace, tokenType: undefined },
      },
      {
        name: 'an application token without an application',
        request: {
          user,
          workspace,
          tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
        },
      },
      {
        name: 'an application token that also carries an API key',
        request: {
          application: installedApplication,
          apiKey,
          workspace,
          tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
        },
      },
      {
        name: 'an OAuth client token that also carries an agent',
        request: {
          application: oauthClient,
          user,
          agentId: 'agent-id',
          workspace,
          tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
        },
      },
      {
        name: 'an application token that carries an impersonation',
        request: {
          application: installedApplication,
          user,
          workspace,
          tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
          impersonationContext,
        },
      },
      {
        name: 'an application without a token type',
        request: {
          application: installedApplication,
          workspace,
          tokenType: undefined,
        },
      },
      {
        name: 'a session token that also carries an application',
        request: {
          user,
          application: installedApplication,
          workspace,
          tokenType: JwtTokenTypeEnum.ACCESS,
        },
      },
      {
        name: 'a session token that also carries an API key',
        request: {
          user,
          apiKey,
          workspace,
          tokenType: JwtTokenTypeEnum.ACCESS,
        },
      },
      {
        name: 'a session token that also carries an agent',
        request: {
          user,
          agentId: 'agent-id',
          workspace,
          tokenType: JwtTokenTypeEnum.ACCESS,
        },
      },
      {
        name: 'a session token without a user',
        request: { workspace, tokenType: JwtTokenTypeEnum.ACCESS },
      },
      {
        name: 'a playground token that also carries an application',
        request: {
          user,
          application: oauthClient,
          workspace,
          tokenType: JwtTokenTypeEnum.PLAYGROUND,
        },
      },
      {
        name: 'a playground token that carries an impersonation',
        request: {
          user,
          workspace,
          tokenType: JwtTokenTypeEnum.PLAYGROUND,
          impersonationContext,
        },
      },
      {
        name: 'a workspace-agnostic token that also carries an API key',
        request: {
          user,
          apiKey,
          tokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
        },
      },
      {
        name: 'a workspace-agnostic token that carries an impersonation',
        request: {
          user,
          tokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
          impersonationContext,
        },
      },
    ])('should refuse $name', async ({ request }) => {
      expect(await isAcceptedOverHttp(ACCEPT_EVERY_PRINCIPAL, request)).toBe(
        false,
      );
    });

    it('should treat a session as impersonated only when both ids are set', async () => {
      expect(
        await isAcceptedOverHttp(
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

    it('should refuse when there is no request on the context', async () => {
      expect(await isAcceptedOverHttp(ACCEPT_EVERY_PRINCIPAL, undefined)).toBe(
        false,
      );
    });
  });

  describe('over GraphQL', () => {
    it('should let an accepted principal through', async () => {
      const result = await runGuardedQuery({
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy({
            ...REFUSE_EVERY_PRINCIPAL,
            userSession: true,
          }),
        ),
        request: REQUEST_BY_PRINCIPAL_VARIANT['userSession.standard'],
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.guardedQuery).toBe('ok');
    });

    it('should refuse with FORBIDDEN', async () => {
      const result = await runGuardedQuery({
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy({
            ...REFUSE_EVERY_PRINCIPAL,
            userSession: true,
          }),
        ),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
      expect(result.errors?.[0]?.originalError).toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should report a request without credentials as UNAUTHENTICATED', async () => {
      const result = await runGuardedQuery({
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy(ACCEPT_EVERY_PRINCIPAL),
        ),
        request: { workspace },
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
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
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy({ ...REFUSE_EVERY_PRINCIPAL, apiKey: true }),
        ),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
      });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
    });

    it('should refuse with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy({
            ...REFUSE_EVERY_PRINCIPAL,
            userSession: true,
          }),
        ),
        request: REQUEST_BY_PRINCIPAL_VARIANT.apiKey,
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
    });

    it('should refuse a request without credentials with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: AccessPolicyGuard(
          buildPrincipalOnlyPolicy(ACCEPT_EVERY_PRINCIPAL),
        ),
        request: {},
        providers: [ACCESS_POLICY_SERVICE_PROVIDER],
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
    });
  });
});
