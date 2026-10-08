import { groupConnectedAccountsByHandle } from '@/settings/accounts/utils/groupConnectedAccountsByHandle';

describe('groupConnectedAccountsByHandle', () => {
  it('groups Google and Fathom by a trimmed case-insensitive email while retaining separate records', () => {
    const google = {
      id: 'google',
      handle: ' Tim@Apple.dev ',
      provider: 'google',
      userWorkspaceId: 'me',
      visibility: 'user',
    };
    const fathom = {
      id: 'fathom',
      handle: 'tim@apple.dev',
      provider: 'app',
      userWorkspaceId: 'another-member',
      visibility: 'workspace',
    };

    const groups = groupConnectedAccountsByHandle([google, fathom]);

    expect(groups).toEqual([
      {
        id: 'email:tim@apple.dev',
        handle: 'tim@apple.dev',
        accounts: [google, fathom],
      },
    ]);
    expect(groups[0].accounts[0]).toBe(google);
    expect(groups[0].accounts[1]).toBe(fathom);
  });

  it('does not fold Gmail aliases or group identical non-email handles', () => {
    const accounts = [
      { id: 'first', handle: 'tim.smith@gmail.com' },
      { id: 'second', handle: 'timsmith@gmail.com' },
      { id: 'third', handle: 'timsmith+meetings@gmail.com' },
      { id: 'fourth', handle: 'team-calendar' },
      { id: 'fifth', handle: 'team-calendar' },
      { id: 'sixth', handle: '' },
      { id: 'seventh', handle: '' },
    ];

    expect(groupConnectedAccountsByHandle(accounts)).toHaveLength(7);
    expect(
      groupConnectedAccountsByHandle(accounts)
        .slice(3)
        .map(({ id }) => id),
    ).toEqual([
      'account:fourth',
      'account:fifth',
      'account:sixth',
      'account:seventh',
    ]);
  });

  it('keeps the email route stable after a connection is removed and preserves group order', () => {
    const first = { id: 'google', handle: 'tim@apple.dev' };
    const other = { id: 'microsoft', handle: 'other@example.com' };
    const second = { id: 'fathom', handle: 'TIM@APPLE.DEV' };

    expect(
      groupConnectedAccountsByHandle([first, other, second]).map(
        ({ id }) => id,
      ),
    ).toEqual(['email:tim@apple.dev', 'email:other@example.com']);
    expect(groupConnectedAccountsByHandle([second])[0].id).toBe(
      'email:tim@apple.dev',
    );
    expect(groupConnectedAccountsByHandle([])).toEqual([]);
  });
});
