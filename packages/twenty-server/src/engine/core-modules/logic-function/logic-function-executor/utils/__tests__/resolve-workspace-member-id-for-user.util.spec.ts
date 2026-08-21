import { resolveWorkspaceMemberIdForUser } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/resolve-workspace-member-id-for-user.util';

const buildMaps = ({ deletedAt }: { deletedAt?: string } = {}) => ({
  byId: { 'workspace-member-1': { deletedAt: deletedAt ?? null } },
  idByUserId: { 'user-1': 'workspace-member-1' },
});

describe('resolveWorkspaceMemberIdForUser', () => {
  it('should name the member the person holds in this workspace', () => {
    expect(
      resolveWorkspaceMemberIdForUser({
        userId: 'user-1',
        flatWorkspaceMemberMaps: buildMaps(),
      }),
    ).toBe('workspace-member-1');
  });

  it('should name no member for a person who has none', () => {
    expect(
      resolveWorkspaceMemberIdForUser({
        userId: 'user-2',
        flatWorkspaceMemberMaps: buildMaps(),
      }),
    ).toBeNull();
  });

  it('should name no member once theirs is soft deleted', () => {
    expect(
      resolveWorkspaceMemberIdForUser({
        userId: 'user-1',
        flatWorkspaceMemberMaps: buildMaps({
          deletedAt: '2026-01-01T00:00:00.000Z',
        }),
      }),
    ).toBeNull();
  });
});
