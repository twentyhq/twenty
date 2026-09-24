import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDefaultKeyScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-key-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_START = new Date('2026-08-20T00:00:00.000Z');

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: true,
  key: 'counter-key',
  limitValue: 1_000,
  meter: 'quantity',
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  periodUnit: 'day',
  periodStart: PERIOD_START,
  periodEnd: new Date('2026-08-21T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

describe('buildQuotaDefaultKeyScope', () => {
  it('projects the scope both default keys are built from', () => {
    expect(
      buildQuotaDefaultKeyScope({
        workspaceId: 'workspace-1',
        counter: buildCounter(),
      }),
    ).toEqual({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenderType: 'workspace',
      spenderId: null,
      meter: 'quantity',
      periodUnit: 'day',
      periodStart: PERIOD_START,
    });
  });

  it('carries the spender the counter is scoped to', () => {
    expect(
      buildQuotaDefaultKeyScope({
        workspaceId: 'workspace-1',
        counter: buildCounter({
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
      }),
    ).toMatchObject({ spenderType: 'userWorkspace', spenderId: 'user-1' });
  });
});
