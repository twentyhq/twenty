import { replaceRuleItemsKeepingOrder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/replaceRuleItemsKeepingOrder';

describe('replaceRuleItemsKeepingOrder', () => {
  it('should update rule items in place, drop removed ones and append new ones', () => {
    expect(
      replaceRuleItemsKeepingOrder({
        previousItems: [
          { id: 'rule-a-1', rule: 'a', value: 'old' },
          { id: 'rule-a-2', rule: 'a', value: 'old' },
          { id: 'rule-b-1', rule: 'b', value: 'old' },
        ],
        nextRuleItems: [
          { id: 'rule-a-1', rule: 'a', value: 'new' },
          { id: 'rule-a-3', rule: 'a', value: 'new' },
        ],
        isRuleItem: ({ rule }) => rule === 'a',
      }),
    ).toEqual([
      { id: 'rule-a-1', rule: 'a', value: 'new' },
      { id: 'rule-b-1', rule: 'b', value: 'old' },
      { id: 'rule-a-3', rule: 'a', value: 'new' },
    ]);
  });
});
