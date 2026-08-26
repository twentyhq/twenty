import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type ResolvedUsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/resolved-usage-limit-fallback.type';
import { buildSpeedBuckets } from 'src/engine/core-modules/usage-limit/utils/build-speed-buckets.util';

const workspace = { id: 'workspace-1' };

// The registry defaults, standing in for API_RATE_LIMITING_* and
// APPLICATION_API_RATE_LIMITING_*.
const RESOLVED_FALLBACKS: ResolvedUsageLimitFallback[] = [
  {
    spenderType: 'apiKey',
    counterScope: 'perWorkspace',
    maxTokens: 100,
    windowMs: 1000,
  },
  {
    spenderType: 'apiKey',
    counterScope: 'perWorkspace',
    maxTokens: 100,
    windowMs: 60_000,
  },
  {
    spenderType: 'application',
    counterScope: 'crossWorkspace',
    maxTokens: 500,
    windowMs: 60_000,
  },
];

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'rule-id',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '',
  limitKind: 'speed',
  windowSeconds: 60,
  limitValueType: 'absolute',
  limitValue: 100,
  burstValue: null,
  ...overrides,
});

const buildBuckets = ({
  authContext,
  rules = [],
}: {
  authContext: WorkspaceAuthContext;
  rules?: FlatUsageLimit[];
}) =>
  buildSpeedBuckets({
    resolvedFallbacks: RESOLVED_FALLBACKS,
    rules,
    authContext,
    resourceType: UsageResourceType.API,
    operationType: UsageOperationType.API_REQUEST,
  });

const apiKeyContext = {
  type: 'apiKey',
  workspace,
  apiKey: { id: 'key-1' },
} as WorkspaceAuthContext;

const applicationContext = {
  type: 'application',
  workspace,
  application: { id: 'app-1', universalIdentifier: 'app-uid' },
} as WorkspaceAuthContext;

const userContext = {
  type: 'user',
  workspace,
  userWorkspaceId: 'user-workspace-1',
} as WorkspaceAuthContext;

const agentRunContext = {
  type: 'user',
  workspace,
  userWorkspaceId: 'user-workspace-1',
  viaApplication: { id: 'app-1', universalIdentifier: 'app-uid' },
} as WorkspaceAuthContext;

const systemContext = { type: 'system', workspace } as WorkspaceAuthContext;

// Parity with the throttler this replaces: it metered API keys against a single
// workspace-wide counter and applications against a cross-workspace one, and
// left every other caller alone.
describe('buildSpeedBuckets with no rules configured', () => {
  it('meters an api key against one shared counter per window', () => {
    expect(buildBuckets({ authContext: apiKeyContext })).toEqual([
      expect.objectContaining({
        key: '{workspace-1}:speed:API:API_REQUEST:apiKey:-:1',
        refillPerWindow: 100,
        spenderType: 'apiKey',
        spenderId: null,
      }),
      expect.objectContaining({
        key: '{workspace-1}:speed:API:API_REQUEST:apiKey:-:60',
        refillPerWindow: 100,
        spenderId: null,
      }),
    ]);
  });

  it('meters an application against one counter across every workspace', () => {
    expect(buildBuckets({ authContext: applicationContext })).toEqual([
      expect.objectContaining({
        key: '{server}:speed:API:API_REQUEST:application:app-uid:60',
        refillPerWindow: 500,
        spenderType: 'application',
        spenderId: 'app-uid',
      }),
    ]);
  });

  it('leaves a front-end request alone', () => {
    expect(buildBuckets({ authContext: userContext })).toEqual([]);
  });

  it('leaves an agent running as a user alone', () => {
    expect(buildBuckets({ authContext: agentRunContext })).toEqual([]);
  });

  it('leaves a system request alone', () => {
    expect(buildBuckets({ authContext: systemContext })).toEqual([]);
  });
});

describe('buildSpeedBuckets with rules configured', () => {
  it('shares one counter between every api key when the rule names none', () => {
    const [bucket] = buildBuckets({
      authContext: apiKeyContext,
      rules: [buildRule({ spenderId: '', limitValue: 10, windowSeconds: 1 })],
    });

    expect(bucket).toMatchObject({
      key: '{workspace-1}:speed:API:API_REQUEST:apiKey:-:1',
      refillPerWindow: 10,
      spenderId: null,
    });
  });

  it('gives a named api key its own counter on top of the shared one', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      rules: [
        buildRule({ id: 'shared', spenderId: '', limitValue: 10 }),
        buildRule({ id: 'own', spenderId: 'key-1', limitValue: 5 }),
      ],
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual([
      '{workspace-1}:speed:API:API_REQUEST:apiKey:key-1:60',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:60',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:1',
    ]);
  });

  it('replaces the default only at the window the rule covers', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      rules: [buildRule({ spenderId: '', windowSeconds: 60, limitValue: 10 })],
    });

    expect(
      buckets.map((bucket) => [bucket.windowMs, bucket.refillPerWindow]),
    ).toEqual([
      [60_000, 10],
      [1000, 100],
    ]);
  });

  it('tells the platform default apart from a configured rule', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      rules: [buildRule({ spenderId: '', windowSeconds: 60, limitValue: 10 })],
    });

    expect(buckets.map((bucket) => bucket.isFallback)).toEqual([false, true]);
  });

  it('applies a workspace rule to a caller that no other rule covers', () => {
    const buckets = buildBuckets({
      authContext: userContext,
      rules: [
        buildRule({
          spenderType: 'workspace',
          spenderId: '',
          limitValue: 1000,
        }),
      ],
    });

    expect(buckets).toEqual([
      expect.objectContaining({
        key: '{workspace-1}:speed:API:API_REQUEST:workspace:-:60',
        refillPerWindow: 1000,
      }),
    ]);
  });
});
