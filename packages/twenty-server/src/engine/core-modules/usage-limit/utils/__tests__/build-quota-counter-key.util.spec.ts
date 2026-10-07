import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const WORKSPACE_ID = 'workspace-1';
const PERIOD_START = new Date('2026-09-01T00:00:00.000Z');

type CounterIdentity = Parameters<typeof buildQuotaCounterKey>[0]['counter'];

const buildKey = (overrides: Partial<CounterIdentity> = {}) =>
  buildQuotaCounterKey({
    workspaceId: WORKSPACE_ID,
    counter: {
      usageLimitId: 'limit-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      spenderId: null,
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
      periodStart: PERIOD_START,
      ...overrides,
    },
  });

describe('buildQuotaCounterKey', () => {
  it('hashes on the workspace and keys a row by its id and scope', () => {
    expect(buildKey()).toBe(
      `{${WORKSPACE_ID}}:quota-consumed:limit-1:AI:AI_CHAT_TOKEN:workspace:-:CREDIT:month:${PERIOD_START.getTime()}`,
    );
  });

  it('keys a default by its identity', () => {
    expect(buildKey({ usageLimitId: null })).toBe(
      `{${WORKSPACE_ID}}:quota-consumed:default:AI:AI_CHAT_TOKEN:workspace:-:CREDIT:month:${PERIOD_START.getTime()}`,
    );
  });

  it.each([
    ['usageLimitId', { usageLimitId: 'limit-2' }],
    ['operationType', { operationType: UsageOperationType.WEB_SEARCH }],
    ['unit', { unit: UsageUnit.TOKEN }],
    ['spenderId', { spenderId: 'user-1' }],
    ['periodUnit', { periodUnit: 'week' as const }],
    ['periodStart', { periodStart: new Date('2026-10-01T00:00:00.000Z') }],
  ])('gives two counters differing only by %s their own key', (_, differs) => {
    expect(buildKey(differs)).not.toBe(buildKey());
  });
});
