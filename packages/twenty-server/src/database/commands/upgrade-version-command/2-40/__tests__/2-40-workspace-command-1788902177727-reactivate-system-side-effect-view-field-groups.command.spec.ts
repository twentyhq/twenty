import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReactivateSystemSideEffectViewFieldGroupsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788902177727-reactivate-system-side-effect-view-field-groups.command';
import { type UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { type ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

// The registry records upgrade migrations as `${version}_${className}_${timestamp}`,
// never the CLI @Command name - the command must look the reconcile run up by this key.
const RECONCILE_MIGRATION_NAME =
  '2.31.0_ReconcileStandardRecordPageCommand_1786437481000';

const RECONCILE_CUTOFF = new Date('2026-01-01T00:00:00.000Z');
const BEFORE_CUTOFF = '2025-12-31T00:00:00.000Z';
const AFTER_CUTOFF = '2026-01-02T00:00:00.000Z';

type ViewFieldGroupFixture = {
  id: string;
  universalIdentifier: string;
  isSystemSideEffect: boolean;
  isActive: boolean;
  deletedAt: string | null;
  updatedAt: string;
};

const buildGroup = (
  overrides: Partial<ViewFieldGroupFixture> & { id: string },
): ViewFieldGroupFixture => ({
  universalIdentifier: `${overrides.id}-universal-identifier`,
  isSystemSideEffect: true,
  isActive: false,
  deletedAt: null,
  updatedAt: BEFORE_CUTOFF,
  ...overrides,
});

describe('ReactivateSystemSideEffectViewFieldGroupsCommand', () => {
  let command: ReactivateSystemSideEffectViewFieldGroupsCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let updateMock: jest.Mock;
  let findOneMock: jest.Mock;

  const mockGroups = (groups: ViewFieldGroupFixture[]) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewFieldGroupMaps: {
        byUniversalIdentifier: Object.fromEntries(
          groups.map((group) => [group.universalIdentifier, group]),
        ),
      },
    });
  };

  const mockReconcileRun = (createdAt: Date | null) => {
    findOneMock.mockImplementation(async ({ where }) =>
      where.name === RECONCILE_MIGRATION_NAME && where.status === 'completed'
        ? createdAt === null
          ? null
          : { createdAt }
        : null,
    );
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    updateMock = jest.fn().mockResolvedValue(undefined);
    findOneMock = jest.fn().mockResolvedValue(null);

    command = new ReactivateSystemSideEffectViewFieldGroupsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      {
        update: updateMock,
      } as unknown as Repository<ViewFieldGroupEntity>,
      {
        findOne: findOneMock,
      } as unknown as Repository<UpgradeMigrationEntity>,
    );
  });

  it('reactivates system-owned groups stuck inactive since the reconcile run', async () => {
    mockReconcileRun(RECONCILE_CUTOFF);
    mockGroups([buildGroup({ id: 'general' }), buildGroup({ id: 'business' })]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);

    const [[whereClause, updatePayload]] = updateMock.mock.calls;

    expect(whereClause.workspaceId).toBe(WORKSPACE_ID);
    expect(whereClause.id.value).toEqual(['general', 'business']);
    expect(updatePayload).toEqual({ isActive: true });
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('skips the workspace when the reconcile run was never recorded', async () => {
    mockReconcileRun(null);
    mockGroups([buildGroup({ id: 'general' })]);

    await runOnWorkspace();

    expect(getOrRecomputeMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('leaves alone groups a user deactivated, deleted, or touched after the reconcile', async () => {
    mockReconcileRun(RECONCILE_CUTOFF);
    mockGroups([
      buildGroup({ id: 'already-active', isActive: true }),
      buildGroup({ id: 'user-deactivated', isSystemSideEffect: false }),
      buildGroup({ id: 'soft-deleted', deletedAt: BEFORE_CUTOFF }),
      buildGroup({ id: 'deactivated-after-reconcile', updatedAt: AFTER_CUTOFF }),
    ]);

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('does not write during a dry run', async () => {
    mockReconcileRun(RECONCILE_CUTOFF);
    mockGroups([buildGroup({ id: 'general' })]);

    await runOnWorkspace(true);

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
