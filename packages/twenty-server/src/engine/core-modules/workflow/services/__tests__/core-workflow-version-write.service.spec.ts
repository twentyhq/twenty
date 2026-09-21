import {
  CoreWorkflowVersionPostCommitError,
  CoreWorkflowVersionWriteService,
} from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';

const workspaceId = '20202020-0000-0000-0000-000000000001';
const coreWorkflowVersionId = '20202020-0000-0000-0000-000000000002';

describe('CoreWorkflowVersionWriteService', () => {
  it('reports cache invalidation failures as post-commit errors', async () => {
    const cacheError = new Error('Cache unavailable');
    const invalidateAutomatedTriggerMaps = jest
      .fn()
      .mockRejectedValue(cacheError);
    const update = jest.fn().mockResolvedValue({ affected: 1 });
    const executeRawQuery = jest
      .fn()
      .mockResolvedValue([{ id: coreWorkflowVersionId }]);
    const runInWorkspaceTransaction = jest
      .fn()
      .mockImplementation(async (callback) =>
        callback({
          getRepository: () => ({ update }),
          executeRawQuery,
        }),
      );
    const executeInWorkspaceContext = jest
      .fn()
      .mockImplementation(async (callback) => callback());

    const service = new CoreWorkflowVersionWriteService(
      {} as never,
      { invalidateAutomatedTriggerMaps } as never,
      {
        assertCoreWorkflowVersionsAreAccessibleOrThrow: jest.fn(),
      } as never,
      {
        getFlatEntityMaps: jest.fn().mockResolvedValue({
          flatObjectMetadataMaps: {},
          flatFieldMetadataMaps: {},
          objectIdByNameSingular: {},
        }),
      } as never,
      { executeInWorkspaceContext, runInWorkspaceTransaction } as never,
      {} as never,
    );

    const writePromise = service.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: { triggers: null, steps: null },
      trigger: null,
      steps: null,
    });

    const writeError = await writePromise.catch((error) => error);

    expect(writeError).toBeInstanceOf(CoreWorkflowVersionPostCommitError);
    expect(writeError).toMatchObject({ cause: cacheError });
    expect(update).toHaveBeenCalledTimes(1);
    expect(executeRawQuery).toHaveBeenCalledTimes(1);
    expect(invalidateAutomatedTriggerMaps).toHaveBeenCalledWith(workspaceId);
  });
});
