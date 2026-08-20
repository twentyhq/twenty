import { resolveTriggeredByWorkspaceMemberId } from 'src/engine/core-modules/application/application-triggered-by/utils/resolve-triggered-by-workspace-member-id.util';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

const buildMaps = ({
  deletedAt,
}: { deletedAt?: Date } = {}): FlatWorkspaceMemberMaps =>
  ({
    idByUserId: { 'user-1': 'workspace-member-1' },
    byId: {
      'workspace-member-1': { id: 'workspace-member-1', deletedAt },
    },
  }) as unknown as FlatWorkspaceMemberMaps;

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
        flatWorkspaceMemberMaps: buildMaps({ deletedAt: new Date() }),
      }),
    ).toBeNull();
  });
});
