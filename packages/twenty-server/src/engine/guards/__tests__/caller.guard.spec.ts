import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  runGuardedQuery,
  runGuardedRestRequest,
} from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { CallerGuard } from 'src/engine/guards/caller.guard';
import { CALLER_REFUSED_MESSAGE } from 'src/engine/guards/constants/caller-refused-message.constant';
import { type CallerGuardConfig } from 'src/engine/guards/types/caller-guard-config.type';
import { type CallerVariant } from 'src/engine/guards/types/caller-variant.type';

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

const REQUEST_BY_CALLER_VARIANT: Record<
  CallerVariant,
  Record<string, unknown>
> = {
  session: { user, workspace, tokenType: JwtTokenTypeEnum.ACCESS },
  impersonatedSession: {
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.ACCESS,
    impersonationContext: {
      impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
      impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
    },
  },
  playgroundSession: {
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.PLAYGROUND,
  },
  workspaceAgnosticSession: {
    user,
    tokenType: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
  },
  apiKey: {
    apiKey: { id: 'api-key-id' },
    workspace,
    tokenType: JwtTokenTypeEnum.API_KEY,
  },
  oauthClientWithUser: {
    application: oauthClient,
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  oauthClientWithoutUser: {
    application: oauthClient,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  applicationWithUser: {
    application: installedApplication,
    user,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
  applicationWithoutUser: {
    application: installedApplication,
    workspace,
    tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
  },
};

const ALL_CALLER_VARIANTS = Object.keys(
  REQUEST_BY_CALLER_VARIANT,
) as CallerVariant[];

const USER_SESSION_VARIANTS: CallerVariant[] = [
  'session',
  'impersonatedSession',
  'playgroundSession',
];

const CONFIG_CASES: {
  name: string;
  callerGuardConfig: CallerGuardConfig;
  acceptedCallerVariants: CallerVariant[];
}[] = [
  {
    name: 'no caller kind',
    callerGuardConfig: {},
    acceptedCallerVariants: [],
  },
  {
    name: 'userSession',
    callerGuardConfig: { userSession: true },
    acceptedCallerVariants: USER_SESSION_VARIANTS,
  },
  {
    name: 'userSession with default options',
    callerGuardConfig: { userSession: {} },
    acceptedCallerVariants: USER_SESSION_VARIANTS,
  },
  {
    name: 'userSession without impersonation',
    callerGuardConfig: { userSession: { impersonation: false } },
    acceptedCallerVariants: ['session', 'playgroundSession'],
  },
  {
    name: 'userSession without playground',
    callerGuardConfig: { userSession: { playground: false } },
    acceptedCallerVariants: ['session', 'impersonatedSession'],
  },
  {
    name: 'userSession with workspace-agnostic',
    callerGuardConfig: { userSession: { workspaceAgnostic: true } },
    acceptedCallerVariants: [
      ...USER_SESSION_VARIANTS,
      'workspaceAgnosticSession',
    ],
  },
  {
    name: 'userSession with every option turned against the default',
    callerGuardConfig: {
      userSession: {
        impersonation: false,
        playground: false,
        workspaceAgnostic: true,
      },
    },
    acceptedCallerVariants: ['session', 'workspaceAgnosticSession'],
  },
  {
    name: 'apiKey',
    callerGuardConfig: { apiKey: true },
    acceptedCallerVariants: ['apiKey'],
  },
  {
    name: 'oauthClient',
    callerGuardConfig: { oauthClient: true },
    acceptedCallerVariants: ['oauthClientWithUser', 'oauthClientWithoutUser'],
  },
  {
    name: 'oauthClient requiring a user',
    callerGuardConfig: { oauthClient: { requireUser: true } },
    acceptedCallerVariants: ['oauthClientWithUser'],
  },
  {
    name: 'application',
    callerGuardConfig: { application: true },
    acceptedCallerVariants: ['applicationWithUser', 'applicationWithoutUser'],
  },
  {
    name: 'application requiring a user',
    callerGuardConfig: { application: { requireUser: true } },
    acceptedCallerVariants: ['applicationWithUser'],
  },
  {
    name: 'every caller kind',
    callerGuardConfig: {
      userSession: true,
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    acceptedCallerVariants: ALL_CALLER_VARIANTS.filter(
      (callerVariant) => callerVariant !== 'workspaceAgnosticSession',
    ),
  },
  {
    name: 'user-bound callers',
    callerGuardConfig: {
      userSession: { workspaceAgnostic: true },
      oauthClient: { requireUser: true },
      application: { requireUser: true },
    },
    acceptedCallerVariants: [
      ...USER_SESSION_VARIANTS,
      'workspaceAgnosticSession',
      'oauthClientWithUser',
      'applicationWithUser',
    ],
  },
  {
    name: 'users and applications',
    callerGuardConfig: {
      userSession: { workspaceAgnostic: true },
      oauthClient: true,
      application: true,
    },
    acceptedCallerVariants: ALL_CALLER_VARIANTS.filter(
      (callerVariant) => callerVariant !== 'apiKey',
    ),
  },
];

const buildHttpContext = (request: unknown): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const canActivateOverHttp = (
  callerGuardConfig: CallerGuardConfig,
  request: unknown,
): boolean => {
  const Guard = CallerGuard(callerGuardConfig);

  try {
    return new Guard().canActivate(buildHttpContext(request)) as boolean;
  } catch (error) {
    if (error instanceof ForbiddenException) {
      return false;
    }

    throw error;
  }
};

describe('CallerGuard', () => {
  describe.each(CONFIG_CASES)(
    'with $name',
    ({ callerGuardConfig, acceptedCallerVariants }) => {
      it.each(
        ALL_CALLER_VARIANTS.map((callerVariant) => ({
          callerVariant,
          decision: acceptedCallerVariants.includes(callerVariant)
            ? 'accept'
            : 'refuse',
        })),
      )('should $decision $callerVariant', ({ callerVariant, decision }) => {
        expect(
          canActivateOverHttp(
            callerGuardConfig,
            REQUEST_BY_CALLER_VARIANT[callerVariant],
          ),
        ).toBe(decision === 'accept');
      });
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
      canActivateOverHttp(
        { userSession: { workspaceAgnostic: true } },
        { user, workspace, tokenType },
      ),
    ).toBe(false);
  });

  it('should treat a session as impersonated only when both ids are set', () => {
    const request = {
      user,
      workspace,
      tokenType: JwtTokenTypeEnum.ACCESS,
      impersonationContext: { impersonatorUserWorkspaceId: 'impersonator-id' },
    };

    expect(
      canActivateOverHttp({ userSession: { impersonation: false } }, request),
    ).toBe(true);
  });

  it('should refuse when there is no request on the context', () => {
    expect(canActivateOverHttp({ userSession: true }, undefined)).toBe(false);
  });

  describe('over GraphQL', () => {
    it('should let an accepted caller through', async () => {
      const result = await runGuardedQuery({
        guard: CallerGuard({ userSession: true }),
        request: REQUEST_BY_CALLER_VARIANT.session,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.guardedQuery).toBe('ok');
    });

    it('should refuse with a ForbiddenException', async () => {
      const result = await runGuardedQuery({
        guard: CallerGuard({ userSession: true }),
        request: REQUEST_BY_CALLER_VARIANT.apiKey,
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.message).toBe(CALLER_REFUSED_MESSAGE);
      expect(result.errors?.[0]?.originalError).toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should report a credential-less request as UNAUTHENTICATED', async () => {
      const result = await runGuardedQuery({
        guard: CallerGuard({ userSession: true }),
        request: { workspace },
      });

      expect(result.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.UNAUTHENTICATED,
      );
    });
  });

  describe('over REST', () => {
    it('should let an accepted caller through', async () => {
      const response = await runGuardedRestRequest({
        guard: CallerGuard({ apiKey: true }),
        request: REQUEST_BY_CALLER_VARIANT.apiKey,
      });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
    });

    it('should refuse with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: CallerGuard({ userSession: true }),
        request: REQUEST_BY_CALLER_VARIANT.apiKey,
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(CALLER_REFUSED_MESSAGE);
    });

    it('should refuse a credential-less request with a 403', async () => {
      const response = await runGuardedRestRequest({
        guard: CallerGuard({ userSession: true }),
        request: {},
      });

      expect(response.status).toBe(403);
    });
  });
});
