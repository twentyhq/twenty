import { resolveTriggeredByWorkspaceMemberId } from 'src/engine/core-modules/application/application-triggered-by/utils/resolve-triggered-by-workspace-member-id.util';

const buildMaps = ({ deletedAt }: { deletedAt?: string } = {}) => ({
  byId: { 'workspace-member-1': { deletedAt: deletedAt ?? null } },
  idByUserId: { 'user-1': 'workspace-member-1' },
});

describe('resolveTriggeredByWorkspaceMemberId', () => {
  it('should name the member the person holds in this workspace', () => {
    expect(
      resolveTriggeredByWorkspaceMemberId({
        userId: 'user-1',
        flatWorkspaceMemberMaps: buildMaps(),
      }),
    ).toBe('workspace-member-1');
  });

  it('should name no member for a person who has none', () => {
    expect(
      resolveTriggeredByWorkspaceMemberId({
        userId: 'user-2',
        flatWorkspaceMemberMaps: buildMaps(),
      }),
    ).toBeNull();
  });

  it('should name no member once theirs is soft deleted', () => {
    expect(
      resolveTriggeredByWorkspaceMemberId({
        userId: 'user-1',
        flatWorkspaceMemberMaps: buildMaps({
          deletedAt: '2026-01-01T00:00:00.000Z',
        }),
      }),
    ).toBeNull();
  });
});
