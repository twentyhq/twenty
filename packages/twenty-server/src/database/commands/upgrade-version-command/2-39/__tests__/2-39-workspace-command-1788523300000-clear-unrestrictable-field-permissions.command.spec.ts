import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ClearUnrestrictableFieldPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788523300000-clear-unrestrictable-field-permissions.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-000000000002';

const buildCommand = (query: jest.Mock) => {
  const invalidateAndRecompute = jest.fn();

  const command = new ClearUnrestrictableFieldPermissionsCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          workspaceCustomFlatApplication: { id: CUSTOM_APPLICATION_ID },
        }),
    } as unknown as ApplicationService,
    { invalidateAndRecompute } as unknown as WorkspaceCacheService,
    { query } as unknown as DataSource,
  );

  jest.spyOn(command['logger'], 'log').mockImplementation();

  return { command, invalidateAndRecompute };
};

describe('ClearUnrestrictableFieldPermissionsCommand', () => {
  it('only counts candidates on a dry run', async () => {
    const query = jest.fn().mockResolvedValue([{ count: '3' }]);
    const { command, invalidateAndRecompute } = buildCommand(query);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun: true },
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SELECT count(*)');
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
    expect(command['logger'].log).toHaveBeenCalledWith(
      `[DRY RUN] Would clear 3 unrestrictable field permission(s) for workspace ${WORKSPACE_ID}`,
    );
  });

  it('clears both kinds of unrestrictable permission and refreshes the permission caches', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }])
      .mockResolvedValueOnce([{ id: 'c' }]);
    const { command, invalidateAndRecompute } = buildCommand(query);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query.mock.calls[0][0]).toContain('DELETE FROM');
    expect(query.mock.calls[0][1]).toEqual([
      WORKSPACE_ID,
      CUSTOM_APPLICATION_ID,
    ]);
    expect(query.mock.calls[1][0]).toContain('labelIdentifierFieldMetadataId');
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ]);
    expect(command['logger'].log).toHaveBeenCalledWith(
      `Deleted 2 field permission(s) on non-editable fields and cleared read on 1 label identifier(s) for workspace ${WORKSPACE_ID}`,
    );
  });

  it('leaves the caches alone when nothing had to be cleared', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const { command, invalidateAndRecompute } = buildCommand(query);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });
});
