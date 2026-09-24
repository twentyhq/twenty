import { buildUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-defaults.util';
import {
  buildUsageLimitScope,
  type UsageLimitScope,
} from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildSpeedScope = (
  overrides: Partial<UsageLimitScope> = {},
): UsageLimitScope =>
  buildUsageLimitScope({
    resourceType: UsageResourceType.EMAIL,
    operationType: UsageOperationType.EMAIL_SEND,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'speed',
    periodCount: 10,
    periodUnit: 'second',
    meter: 'quantity',
    ...overrides,
  });

const buildStockScope = (
  overrides: Partial<UsageLimitScope> = {},
): UsageLimitScope =>
  buildUsageLimitScope({
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'stock',
    periodCount: 1,
    periodUnit: 'lifetime',
    meter: 'bytes',
    ...overrides,
  });

describe('findSuppressedUsageLimitDefaults', () => {
  it('returns only the overridable default when a resource declares one of each', () => {
    const suppressed = findSuppressedUsageLimitDefaults(buildSpeedScope());

    expect(suppressed).toHaveLength(1);
    expect(suppressed[0]).toMatchObject({
      isOverridable: true,
      counterScope: 'perWorkspace',
      limitValueConfigVariable: 'EMAIL_SEND_WORKSPACE_RATE_LIMITING_LIMIT',
    });
  });

  it('leaves the other operation of the same resource alone', () => {
    const suppressed = findSuppressedUsageLimitDefaults(
      buildSpeedScope({
        operationType: UsageOperationType.MESSAGE_CAMPAIGN_SEND,
      }),
    );

    expect(suppressed).toHaveLength(1);
    expect(suppressed[0].operationType).toBe(
      UsageOperationType.MESSAGE_CAMPAIGN_SEND,
    );
  });

  it('replaces the api key default whatever period the row names', () => {
    const suppressed = findSuppressedUsageLimitDefaults(
      buildSpeedScope({
        resourceType: UsageResourceType.API,
        operationType: UsageOperationType.API_REQUEST,
        spenderType: 'apiKey',
        periodCount: 1,
      }),
    );

    expect(suppressed.map((entry) => entry.limitValueConfigVariable)).toEqual([
      'API_RATE_LIMITING_LONG_LIMIT',
    ]);
  });

  it('returns nothing where only a non-overridable default stands', () => {
    expect(
      findSuppressedUsageLimitDefaults(
        buildSpeedScope({
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          spenderType: 'application',
        }),
      ),
    ).toEqual([]);
  });

  it('returns nothing for a meter no default is declared on', () => {
    expect(
      findSuppressedUsageLimitDefaults(buildStockScope({ meter: 'quantity' })),
    ).toEqual([]);
  });

  it('returns nothing for a row scoped to one spender', () => {
    expect(
      findSuppressedUsageLimitDefaults(
        buildStockScope({ spenderId: 'ef0cfbbd-8b6e-4f9d-9a7c-1a2b3c4d5e6f' }),
      ),
    ).toEqual([]);
  });

  // The admin panel shows one editable row per overridable default and names the
  // single row standing in for it. A second overridable default on one scope
  // would make both rows point at the same row and report the same value.
  it('declares at most one overridable default per suppressible scope', () => {
    const suppressionKeysWithTwoDefaults = Object.values(UsageResourceType)
      .flatMap((resourceType) => buildUsageLimitDefaults({ resourceType }))
      .filter((usageLimitDefault) => usageLimitDefault.isOverridable)
      .map(
        (usageLimitDefault) =>
          `${usageLimitDefault.resourceType}:${usageLimitDefault.operationType}:${usageLimitDefault.spenderType}:${usageLimitDefault.limitKind}:${usageLimitDefault.meter}`,
      )
      .filter(
        (suppressionKey, _index, suppressionKeys) =>
          suppressionKeys.filter((key) => key === suppressionKey).length > 1,
      );

    expect(suppressionKeysWithTwoDefaults).toEqual([]);
  });

  it('returns nothing for a resource that declares no default', () => {
    expect(
      findSuppressedUsageLimitDefaults(
        buildStockScope({
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          limitKind: 'quota',
          periodUnit: 'month',
          meter: 'creditsUsedMicro',
        }),
      ),
    ).toEqual([]);
  });
});
