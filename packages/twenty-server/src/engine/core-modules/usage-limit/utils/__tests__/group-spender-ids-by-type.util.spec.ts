import { groupSpenderIdsByType } from 'src/engine/core-modules/usage-limit/utils/group-spender-ids-by-type.util';

describe('groupSpenderIdsByType', () => {
  it('groups the spender ids of every scoped limit by spender type', () => {
    expect(
      groupSpenderIdsByType([
        { spenderType: 'userWorkspace', spenderId: 'user-1' },
        { spenderType: 'userWorkspace', spenderId: 'user-2' },
        { spenderType: 'apiKey', spenderId: 'key-1' },
      ]),
    ).toEqual(
      new Map([
        ['userWorkspace', ['user-1', 'user-2']],
        ['apiKey', ['key-1']],
      ]),
    );
  });

  it('skips limits shared by every spender of their type', () => {
    expect(
      groupSpenderIdsByType([
        { spenderType: 'workspace', spenderId: '' },
        { spenderType: 'agent', spenderId: '' },
      ]),
    ).toEqual(new Map());
  });
});
