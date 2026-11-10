import { resolveViewOwnerForBackfill } from 'src/database/commands/upgrade-version-command/2-58/utils/resolve-view-owner-for-backfill.util';

const privateView = {
  id: 'view',
  visibility: 'UNLISTED' as const,
  createdByUserWorkspaceId: 'alice',
  ownerUserWorkspaceId: null,
  activeOwnerUserWorkspaceId: null,
  activeCreatorUserWorkspaceId: 'alice',
};

describe('resolveViewOwnerForBackfill', () => {
  it('backfills an active same-workspace creator', () => {
    expect(resolveViewOwnerForBackfill(privateView)).toBe('alice');
  });

  it('keeps a private orphan without an eligible creator', () => {
    expect(
      resolveViewOwnerForBackfill({
        ...privateView,
        activeCreatorUserWorkspaceId: null,
      }),
    ).toBeNull();
  });

  it('preserves an existing active owner different from the creator', () => {
    expect(
      resolveViewOwnerForBackfill({
        ...privateView,
        ownerUserWorkspaceId: 'bob',
        activeOwnerUserWorkspaceId: 'bob',
      }),
    ).toBe('bob');
  });

  it('clears a removed creator-owner and remains quarantined on rerun', () => {
    const removedCreatorView = {
      ...privateView,
      ownerUserWorkspaceId: 'alice',
      activeCreatorUserWorkspaceId: null,
    };
    const ownerUserWorkspaceId =
      resolveViewOwnerForBackfill(removedCreatorView);

    expect(ownerUserWorkspaceId).toBeNull();
    expect(
      resolveViewOwnerForBackfill({
        ...removedCreatorView,
        ownerUserWorkspaceId,
      }),
    ).toBeNull();
    expect(removedCreatorView.createdByUserWorkspaceId).toBe('alice');
  });

  it('rejects an invalid distinct owner instead of making the creator eligible on rerun', () => {
    const view = { ...privateView, ownerUserWorkspaceId: 'bob' };

    expect(() => resolveViewOwnerForBackfill(view)).toThrow(
      'inactive or cross-workspace owner',
    );
    expect(() => resolveViewOwnerForBackfill(view)).toThrow(
      'inactive or cross-workspace owner',
    );
    expect(view.ownerUserWorkspaceId).toBe('bob');
  });

  it('clears an owner on a shared view', () => {
    expect(
      resolveViewOwnerForBackfill({
        ...privateView,
        visibility: 'WORKSPACE',
        ownerUserWorkspaceId: 'bob',
        activeOwnerUserWorkspaceId: 'bob',
      }),
    ).toBeNull();
  });
});
