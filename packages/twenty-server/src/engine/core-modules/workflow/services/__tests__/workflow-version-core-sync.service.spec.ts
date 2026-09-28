import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { resolveCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/resolve-core-workflow-ids-by-workspace-workflow-id.util';
import { resolveLegacyCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/resolve-legacy-core-workflow-ids-by-workspace-workflow-id.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const setup = () => {
  const version = {
    id: 'version',
    workflowId: 'workflow',
    coreWorkflowVersionId: 'core-version',
    status: 'DRAFT',
  } as WorkflowVersionWorkspaceEntity;
  const executeRawQuery = jest
    .fn()
    .mockImplementation(async (query: string) => {
      if (query.startsWith('SELECT "id"')) {
        return [
          {
            id: 'core-version',
            workspaceId: 'workspace',
            workflowId: 'workflow',
            coreWorkflowId: 'core-workflow',
            workspaceWorkflowVersionId: 'version',
          },
        ];
      }
      if (query.startsWith('SELECT id,')) {
        return [{ id: 'core-version', coreWorkflowId: 'core-workflow' }];
      }
      if (query.startsWith('SELECT "workspaceId"')) {
        return [{ workspaceId: 'workspace', workspaceWorkflowId: 'workflow' }];
      }
      if (query.startsWith('INSERT')) {
        return [{ id: 'core-version' }];
      }
      throw new Error(`Unexpected query: ${query}`);
    });
  const afterCommit = jest.fn();
  const transactionScope = {
    executeRawQuery,
    afterCommit,
    getRepository: () => ({
      findOne: async () => ({ coreWorkflowId: 'core-workflow' }),
    }),
  } as unknown as WorkspaceTransactionScope;
  const service = new WorkflowVersionCoreSyncService(
    {} as never,
    {} as never,
    {} as never,
    {
      getOrRecompute: async () => ({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
              .universalIdentifier]: {},
          },
        },
      }),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const mirror = () =>
    service.mirrorWorkflowVersionWrite({
      workspaceId: 'workspace',
      transactionScope,
      workflowVersion: version,
      applicationId: 'application',
    });
  return { mirror, executeRawQuery, afterCommit };
};

describe('Post-upgrade workflow mirroring', () => {
  it('writes the reverse version mapping without probing the schema', async () => {
    const { mirror, executeRawQuery, afterCommit } = setup();
    await expect(mirror()).resolves.toEqual({
      coreWorkflowVersionId: 'core-version',
    });
    expect(executeRawQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        '"workspaceWorkflowVersionId" = EXCLUDED."workspaceWorkflowVersionId"',
      ),
      expect.arrayContaining(['version']),
    );
    expect(
      executeRawQuery.mock.calls.some(([query]) =>
        query.includes('information_schema'),
      ),
    ).toBe(false);
    expect(afterCommit).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      workspaceId: 'foreign',
      workflowId: 'workflow',
      workspaceWorkflowVersionId: 'version',
    },
    {
      workspaceId: 'workspace',
      workflowId: 'other',
      workspaceWorkflowVersionId: 'version',
    },
    {
      workspaceId: 'workspace',
      workflowId: 'workflow',
      workspaceWorkflowVersionId: 'other',
    },
  ])('rejects a conflicting version mapping %j', async (mapping) => {
    const { mirror, executeRawQuery, afterCommit } = setup();
    executeRawQuery.mockResolvedValueOnce([{ id: 'core-version', ...mapping }]);
    await expect(mirror()).rejects.toThrow('Conflicting core mapping');
    expect(afterCommit).not.toHaveBeenCalled();
    expect(executeRawQuery).toHaveBeenCalledTimes(1);
  });

  it('rejects an ambiguous reverse version mapping', async () => {
    const { mirror, executeRawQuery } = setup();
    executeRawQuery
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'first' }, { id: 'second' }]);
    await expect(mirror()).rejects.toThrow('Ambiguous core mapping');
  });

  it('rejects a workflow pointer into another workspace', async () => {
    const { mirror, executeRawQuery } = setup();
    executeRawQuery
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'core-version' }])
      .mockResolvedValueOnce([
        { workspaceId: 'foreign', workspaceWorkflowId: 'workflow' },
      ]);
    await expect(mirror()).rejects.toThrow(
      'Conflicting core mapping for workflow workflow',
    );
  });

  it('resolves live reverse mappings directly', async () => {
    const executeQuery = jest
      .fn()
      .mockResolvedValue([
        { id: 'core-workflow', workspaceWorkflowId: 'workflow' },
      ]);
    await expect(
      resolveCoreWorkflowIdsByWorkspaceWorkflowId({
        executeQuery,
        workspaceId: 'workspace',
        workspaceWorkflowIds: ['workflow'],
      }),
    ).resolves.toEqual(new Map([['workflow', 'core-workflow']]));
    expect(executeQuery).toHaveBeenCalledTimes(1);
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('FROM core."workflow"'),
      ['workspace', ['workflow']],
    );
  });

  it('preserves absent-column compatibility for historical upgrades', async () => {
    const executeQuery = jest.fn().mockResolvedValue([]);
    await expect(
      resolveLegacyCoreWorkflowIdsByWorkspaceWorkflowId({
        executeQuery,
        workspaceId: 'workspace',
        workspaceWorkflowIds: ['workflow'],
      }),
    ).resolves.toEqual(new Map());
    expect(executeQuery).toHaveBeenCalledTimes(1);
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('information_schema'),
    );
  });
});
