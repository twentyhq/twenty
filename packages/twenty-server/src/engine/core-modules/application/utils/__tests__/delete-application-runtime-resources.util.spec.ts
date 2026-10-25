import { deleteApplicationRuntimeResources } from 'src/engine/core-modules/application/utils/delete-application-runtime-resources.util';

describe('deleteApplicationRuntimeResources', () => {
  const workspaceId = 'workspace-id';

  const buildLogicFunctionDriver = () => ({
    delete: jest.fn().mockResolvedValue(undefined),
    deleteApplicationResources: jest.fn().mockResolvedValue(undefined),
  });

  it('should delete every logic function and the resources of every application', async () => {
    const logicFunctionDriver = buildLogicFunctionDriver();

    await deleteApplicationRuntimeResources({
      logicFunctionDriver,
      workspaceId,
      applicationUniversalIdentifiers: ['application-a', 'application-b'],
      logicFunctionIds: ['logic-function-a', 'logic-function-b'],
    });

    expect(logicFunctionDriver.delete.mock.calls).toEqual([
      [{ id: 'logic-function-a' }],
      [{ id: 'logic-function-b' }],
    ]);
    expect(logicFunctionDriver.deleteApplicationResources.mock.calls).toEqual([
      [{ workspaceId, applicationUniversalIdentifier: 'application-a' }],
      [{ workspaceId, applicationUniversalIdentifier: 'application-b' }],
    ]);
  });

  it('should keep deleting after a failure and report what failed', async () => {
    const logicFunctionDriver = buildLogicFunctionDriver();

    logicFunctionDriver.delete.mockRejectedValueOnce(
      new Error('Rate exceeded'),
    );
    logicFunctionDriver.deleteApplicationResources.mockRejectedValueOnce(
      new Error('Access denied'),
    );

    await expect(
      deleteApplicationRuntimeResources({
        logicFunctionDriver,
        workspaceId,
        applicationUniversalIdentifiers: ['application-a', 'application-b'],
        logicFunctionIds: ['logic-function-a', 'logic-function-b'],
      }),
    ).rejects.toThrow(
      'Failed to delete runtime resources for workspace workspace-id: logic function logic-function-a: Rate exceeded; application application-a: Access denied',
    );

    expect(logicFunctionDriver.delete).toHaveBeenCalledTimes(2);
    expect(
      logicFunctionDriver.deleteApplicationResources,
    ).toHaveBeenCalledTimes(2);
  });

  it('should do nothing when there is nothing to delete', async () => {
    const logicFunctionDriver = buildLogicFunctionDriver();

    await deleteApplicationRuntimeResources({
      logicFunctionDriver,
      workspaceId,
      applicationUniversalIdentifiers: [],
      logicFunctionIds: [],
    });

    expect(logicFunctionDriver.delete).not.toHaveBeenCalled();
    expect(
      logicFunctionDriver.deleteApplicationResources,
    ).not.toHaveBeenCalled();
  });
});
