import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const WORKSPACE_ID = 'workspace-1';
const PERIOD_START = new Date('2026-09-01T00:00:00.000Z');

const buildKey = (
  overrides: Partial<Parameters<typeof buildQuotaCounterKey>[0]> = {},
) =>
  buildQuotaCounterKey({
    workspaceId: WORKSPACE_ID,
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    spenderType: 'workspace',
    spenderId: null,
    unit: UsageUnit.CREDIT,
    periodUnit: 'month',
    periodStart: PERIOD_START,
    limitValue: 1000,
    ...overrides,
  });

describe('buildQuotaCounterKey', () => {
  it('hashes on the workspace so every counter of a workspace shares a slot', () => {
    expect(buildKey()).toBe(
      `{${WORKSPACE_ID}}:quota:AI:AI_CHAT_TOKEN:workspace:-:CREDIT:month:${PERIOD_START.getTime()}:1000`,
    );
  });

  it.each([
    ['operationType', { operationType: UsageOperationType.WEB_SEARCH }],
    ['unit', { unit: UsageUnit.TOKEN }],
    ['spenderId', { spenderId: 'user-1' }],
    ['periodUnit', { periodUnit: 'week' as const }],
    ['periodStart', { periodStart: new Date('2026-10-01T00:00:00.000Z') }],
    ['limitValue', { limitValue: 2000 }],
  ])(
    'gives two limits differing only by %s their own counter',
    (_, differs) => {
      expect(buildKey(differs)).not.toBe(buildKey());
    },
  );
});
