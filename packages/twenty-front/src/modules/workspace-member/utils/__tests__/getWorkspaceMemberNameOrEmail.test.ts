import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

describe('getWorkspaceMemberNameOrEmail', () => {
  it('uses the full name when there is one', () => {
    expect(
      getWorkspaceMemberNameOrEmail({
        name: { firstName: 'Jane', lastName: '' },
        userEmail: 'jane@apple.dev',
      }),
    ).toBe('Jane');
  });

  it('falls back to the email without a name', () => {
    expect(
      getWorkspaceMemberNameOrEmail({
        name: { firstName: ' ', lastName: '' },
        userEmail: 'jane@apple.dev',
      }),
    ).toBe('jane@apple.dev');
  });
});
