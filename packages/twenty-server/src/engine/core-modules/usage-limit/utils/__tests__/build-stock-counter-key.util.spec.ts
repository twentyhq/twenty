import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const WORKSPACE_ID = 'workspace-1';

const buildKey = (
  overrides: Partial<Parameters<typeof buildStockCounterKey>[0]> = {},
) =>
  buildStockCounterKey({
    workspaceId: WORKSPACE_ID,
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenderType: 'workspace',
    spenderId: null,
    meter: 'bytes',
    ...overrides,
  });

describe('buildStockCounterKey', () => {
  it('hashes on the workspace so every counter of a workspace shares a slot', () => {
    expect(buildKey()).toBe(
      `{${WORKSPACE_ID}}:stock:STORAGE:STORAGE_FILE:workspace:-:bytes`,
    );
  });

  it('names an absent spender rather than leaving the segment empty', () => {
    expect(buildKey({ spenderType: 'application', spenderId: 'app-1' })).toBe(
      `{${WORKSPACE_ID}}:stock:STORAGE:STORAGE_FILE:application:app-1:bytes`,
    );
  });

  it.each([
    ['operationType', { operationType: UsageOperationType.CALL_RECORDING }],
    ['meter', { meter: 'quantity' as const }],
    ['spenderId', { spenderId: 'app-1' }],
  ])(
    'gives two limits differing only by %s their own counter',
    (_, differs) => {
      expect(buildKey(differs)).not.toBe(buildKey());
    },
  );
});
