import { deleteApplicationRuntimeResources } from 'src/engine/core-modules/application/utils/delete-application-runtime-resources.util';

describe('deleteApplicationRuntimeResources', () => {
  const workspaceId = 'workspace-id';

  it('should delete the resources of every application', async () => {
    const deleteApplicationResources = jest.fn().mockResolvedValue(undefined);

    await deleteApplicationRuntimeResources({
      logicFunctionDriver: { deleteApplicationResources },
      workspaceId,
      applicationUniversalIdentifiers: ['application-a', 'application-b'],
    });

    expect(deleteApplicationResources.mock.calls).toEqual([
      [{ workspaceId, applicationUniversalIdentifier: 'application-a' }],
      [{ workspaceId, applicationUniversalIdentifier: 'application-b' }],
    ]);
  });

  it('should keep deleting after a failure and report the failed applications', async () => {
    const deleteApplicationResources = jest
      .fn()
      .mockRejectedValueOnce(new Error('Rate exceeded'))
      .mockResolvedValueOnce(undefined);

    await expect(
      deleteApplicationRuntimeResources({
        logicFunctionDriver: { deleteApplicationResources },
        workspaceId,
        applicationUniversalIdentifiers: ['application-a', 'application-b'],
      }),
    ).rejects.toThrow(
      'Failed to delete runtime resources for workspace workspace-id: application-a: Rate exceeded',
    );

    expect(deleteApplicationResources).toHaveBeenCalledTimes(2);
  });

  it('should do nothing when the workspace has no applications', async () => {
    const deleteApplicationResources = jest.fn();

    await deleteApplicationRuntimeResources({
      logicFunctionDriver: { deleteApplicationResources },
      workspaceId,
      applicationUniversalIdentifiers: [],
    });

    expect(deleteApplicationResources).not.toHaveBeenCalled();
  });
});
