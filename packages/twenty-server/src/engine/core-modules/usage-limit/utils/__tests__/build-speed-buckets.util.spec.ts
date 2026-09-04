import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type SpeedLimitDefault } from 'src/engine/core-modules/usage-limit/types/speed-limit-default.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildSpeedBuckets } from 'src/engine/core-modules/usage-limit/utils/build-speed-buckets.util';

const workspace = { id: 'workspace-1' };

// The registry defaults, standing in for API_RATE_LIMITING_* and
// APPLICATION_API_RATE_LIMITING_*.
const SPEED_LIMIT_DEFAULTS: SpeedLimitDefault[] = [
  {
    spenderType: 'apiKey',
    counterScope: 'perWorkspace',
    maxTokens: 100,
    windowMs: 1000,
    isOverridable: true,
  },
  {
    spenderType: 'apiKey',
    counterScope: 'perWorkspace',
    maxTokens: 100,
    windowMs: 60_000,
    isOverridable: true,
  },
  {
    spenderType: 'application',
    counterScope: 'crossWorkspace',
    maxTokens: 500,
    windowMs: 60_000,
    isOverridable: false,
  },
];

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-id',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  meter: 'quantity',
  limitValueType: 'absolute',
  limitValue: 100,
  burstValue: null,
  ...overrides,
});

const buildBuckets = ({
  authContext,
  limits = [],
  speedLimitDefaults = SPEED_LIMIT_DEFAULTS,
}: {
  authContext: WorkspaceAuthContext;
  limits?: FlatUsageLimit[];
  speedLimitDefaults?: SpeedLimitDefault[];
}) =>
  buildSpeedBuckets({
    speedLimitDefaults,
    limits,
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
describe('buildSpeedBuckets with no limits configured', () => {
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

describe('buildSpeedBuckets for a spender no application identifies', () => {
  const WORKSPACE_DEFAULTS: SpeedLimitDefault[] = [
    {
      spenderType: 'workspace',
      counterScope: 'crossWorkspace',
      maxTokens: 14,
      windowMs: 10_000,
      isOverridable: true,
    },
  ];

  it('meters a system sender against one counter across every workspace', () => {
    expect(
      buildBuckets({
        authContext: systemContext,
        speedLimitDefaults: WORKSPACE_DEFAULTS,
      }),
    ).toEqual([
      expect.objectContaining({
        key: '{server}:speed:API:API_REQUEST:workspace:-:10',
        refillPerWindow: 14,
        spenderType: 'workspace',
        spenderId: null,
      }),
    ]);
  });

  it('meters a user request against that same counter', () => {
    const [bucket] = buildBuckets({
      authContext: userContext,
      speedLimitDefaults: WORKSPACE_DEFAULTS,
    });

    expect(bucket.key).toBe('{server}:speed:API:API_REQUEST:workspace:-:10');
  });

  it('still drops an application bucket when no application identifies the caller', () => {
    const unidentifiedApplicationContext = {
      type: 'application',
      workspace,
      application: { id: 'app-1' },
    } as WorkspaceAuthContext;

    expect(
      buildBuckets({
        authContext: unidentifiedApplicationContext,
        speedLimitDefaults: [
          {
            spenderType: 'application',
            counterScope: 'crossWorkspace',
            maxTokens: 500,
            windowMs: 60_000,
            isOverridable: false,
          },
        ],
      }),
    ).toEqual([]);
  });
});

describe('buildSpeedBuckets with limits configured', () => {
  it('shares one counter between every api key when the limit names none', () => {
    const [bucket] = buildBuckets({
      authContext: apiKeyContext,
      limits: [buildLimit({ spenderId: '', limitValue: 10, periodCount: 1 })],
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
      limits: [
        buildLimit({ id: 'shared', spenderId: '', limitValue: 10 }),
        buildLimit({ id: 'own', spenderId: 'key-1', limitValue: 5 }),
      ],
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual([
      '{workspace-1}:speed:API:API_REQUEST:apiKey:key-1:60',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:60',
    ]);
  });

  it('keeps a named api key charged for the defaults', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      limits: [buildLimit({ spenderId: 'key-1', limitValue: 5 })],
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual([
      '{workspace-1}:speed:API:API_REQUEST:apiKey:key-1:60',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:1',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:60',
    ]);
  });

  it('replaces every default once a limit covers the spender type', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      limits: [buildLimit({ spenderId: '', periodCount: 60, limitValue: 10 })],
    });

    expect(
      buckets.map((bucket) => [bucket.windowMs, bucket.refillPerWindow]),
    ).toEqual([[60_000, 10]]);
  });

  it('tells the platform default apart from a configured limit', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      limits: [buildLimit({ spenderId: 'key-1', limitValue: 5 })],
    });

    expect(buckets.map((bucket) => bucket.isDefault)).toEqual([
      false,
      true,
      true,
    ]);
  });

  it('keeps an application charged for the ceiling every workspace shares', () => {
    const buckets = buildBuckets({
      authContext: applicationContext,
      limits: [buildLimit({ spenderType: 'application', spenderId: '' })],
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual([
      '{server}:speed:API:API_REQUEST:application:app-uid:60',
      '{workspace-1}:speed:API:API_REQUEST:application:-:60',
    ]);
  });

  it('gives a limit covering every operation its own counter next to a specific one', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      limits: [
        buildLimit({
          id: 'every-operation',
          operationType: UsageOperationType.ALL,
          spenderId: '',
          limitValue: 20,
        }),
        buildLimit({ id: 'specific', spenderId: '', limitValue: 10 }),
      ],
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual([
      '{workspace-1}:speed:API:ALL:apiKey:-:60',
      '{workspace-1}:speed:API:API_REQUEST:apiKey:-:60',
    ]);
  });

  it('ignores a quota limit covering every spender', () => {
    const buckets = buildBuckets({
      authContext: apiKeyContext,
      limits: [
        buildLimit({
          id: 'quota',
          limitKind: 'quota',
          spenderId: '',
          periodCount: 1,
          periodUnit: 'month',
          meter: 'creditsUsedMicro',
        }),
      ],
    });

    expect(buckets.map((bucket) => bucket.isDefault)).toEqual([true, true]);
  });

  it('applies a workspace limit to a caller that no other limit covers', () => {
    const buckets = buildBuckets({
      authContext: userContext,
      limits: [
        buildLimit({
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
