import { isActiveUserWorkspace } from 'src/engine/core-modules/user-workspace/utils/is-active-user-workspace.util';

describe('isActiveUserWorkspace', () => {
  it('accepts an active membership with an enabled user', () => {
    expect(
      isActiveUserWorkspace({
        deletedAt: null,
        user: { disabled: false, deletedAt: null },
      }),
    ).toBe(true);
  });

  it('keeps users with a nullable disabled flag active', () => {
    expect(isActiveUserWorkspace({ user: { disabled: null } })).toBe(true);
  });

  it('rejects disabled users', () => {
    expect(isActiveUserWorkspace({ user: { disabled: true } })).toBe(false);
  });

  it('rejects deleted memberships', () => {
    expect(
      isActiveUserWorkspace({
        deletedAt: new Date('2026-10-27T00:00:00Z'),
        user: { disabled: false },
      }),
    ).toBe(false);
  });

  it('rejects deleted users', () => {
    expect(
      isActiveUserWorkspace({
        user: {
          disabled: false,
          deletedAt: new Date('2026-10-27T00:00:00Z'),
        },
      }),
    ).toBe(false);
  });

  it.each([null, undefined])(
    'rejects a missing membership (%s)',
    (membership) => {
      expect(isActiveUserWorkspace(membership)).toBe(false);
    },
  );

  it.each([null, undefined])('rejects a missing user (%s)', (user) => {
    expect(isActiveUserWorkspace({ user })).toBe(false);
  });
});
