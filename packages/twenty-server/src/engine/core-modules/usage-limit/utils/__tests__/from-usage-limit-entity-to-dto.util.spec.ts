import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';

const buildEntity = (overrides: Partial<UsageLimitEntity>): UsageLimitEntity =>
  ({
    id: 'usage-limit-id',
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.ALL,
    spenderType: 'userWorkspace',
    spenderId: '',
    limitKind: 'quota',
    periodCount: 1,
    periodUnit: 'month',
    meter: 'creditsUsedMicro',
    limitValueType: 'absolute',
    limitValue: 3000,
    burstValue: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }) as UsageLimitEntity;

describe('fromUsageLimitEntityToDto', () => {
  it('exposes the every-spender rule with a null spender id', () => {
    expect(fromUsageLimitEntityToDto(buildEntity({ spenderId: '' }))).toEqual(
      expect.objectContaining({ spenderId: null }),
    );
  });

  it('keeps a named spender id', () => {
    expect(
      fromUsageLimitEntityToDto(
        buildEntity({ spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419' }),
      ),
    ).toEqual(
      expect.objectContaining({
        spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      }),
    );
  });
});
