import { v4 } from 'uuid';
import { parseRecordPermissionPolicy } from 'twenty-shared/utils';

import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { hasRecordPermissionConditionChanges } from 'src/engine/core-modules/record-permission/utils/has-record-permission-condition-changes.util';

describe('Conditional policy authoring entitlement', () => {
  const { context } = createRecordPermissionTestContext();
  const active = context.definition;

  it('requires the entitlement for first publication and new conditional grants', () => {
    expect(hasRecordPermissionConditionChanges(active)).toBe(true);
    const changed = parseRecordPermissionPolicy(active);
    changed.objects[0].rules.push({
      ...changed.objects[0].rules[0],
      universalIdentifier: v4(),
    });
    expect(hasRecordPermissionConditionChanges(changed, active)).toBe(true);
  });

  it('allows unrelated object changes without disabling an existing conditional policy', () => {
    const changed = parseRecordPermissionPolicy(active);
    changed.objects[1].rules.push({
      ...active.objects[0].rules[0],
      universalIdentifier: v4(),
      condition: null,
    });
    expect(hasRecordPermissionConditionChanges(changed, active)).toBe(false);
  });

  it('allows removing a conditional grant after the entitlement is disabled', () => {
    const changed = parseRecordPermissionPolicy(active);
    changed.objects[0].rules = [];
    expect(hasRecordPermissionConditionChanges(changed, active)).toBe(false);
  });

  it.each(['role', 'action', 'object'] as const)(
    'requires the entitlement when the conditional grant changes %s',
    (change) => {
      const changed = parseRecordPermissionPolicy(active);
      if (change === 'role')
        changed.objects[0].rules[0].roleUniversalIdentifier = v4();
      if (change === 'action')
        changed.objects[0].rules[0].actions.push('destroy');
      if (change === 'object')
        changed.objects[1].rules.push(...changed.objects[0].rules.splice(0));
      expect(hasRecordPermissionConditionChanges(changed, active)).toBe(true);
    },
  );
});
