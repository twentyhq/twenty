import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const WORKSPACE_ID = 'workspace-1';

const buildKey = (
  overrides: Partial<
    Parameters<typeof buildStockCounterKey>[0]['counter']
  > = {},
) =>
  buildStockCounterKey({
    workspaceId: WORKSPACE_ID,
    counter: {
      resourceType: UsageResourceType.STORAGE,
      spenderType: 'workspace',
      spenderId: null,
      unit: UsageUnit.BYTE,
      ...overrides,
    },
  });

describe('buildStockCounterKey', () => {
  it('keys the held stock by its scope alone, under the workspace hash tag', () => {
    expect(buildKey()).toBe(
      `{${WORKSPACE_ID}}:stock-held:STORAGE:workspace:-:BYTE`,
    );
  });

  it('names the spender when the scope has one', () => {
    expect(buildKey({ spenderType: 'application', spenderId: 'app-1' })).toBe(
      `{${WORKSPACE_ID}}:stock-held:STORAGE:application:app-1:BYTE`,
    );
  });

  it.each([
    ['resourceType', { resourceType: UsageResourceType.RECORD }],
    ['unit', { unit: UsageUnit.FILE }],
    ['spenderId', { spenderId: 'app-1' }],
  ] as const)(
    'gives two scopes differing only by %s their own counter',
    (_, differs) => {
      expect(buildKey(differs)).not.toBe(buildKey());
    },
  );
});
