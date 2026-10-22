import {
  Lambda,
  CreateFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
  ResourceConflictException,
} from '@aws-sdk/client-lambda';
import { promises as fs } from 'fs';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file',
  () => ({ createZipFile: jest.fn() }),
);
jest.mock('@aws-sdk/client-lambda', () => ({
  ...jest.requireActual('@aws-sdk/client-lambda'),
  Lambda: jest.fn(),
}));

const options = {
  region: 'eu-west-1',
  lambdaRole: 'existing-role',
  resourceNamespace: 'instance',
  layerBucket: 'bucket',
  layerBucketRegion: 'eu-west-1',
};

describe('Lambda builder deployment', () => {
  const send = jest.fn();
  const copyFiles = jest.fn();
  let service: LambdaToolFunctionsService;
  let waitForActive: jest.SpyInstance;
  let cleanup: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    send.mockReset();
    const client = new Lambda({ region: options.region });
    Object.assign(client, { send });
    const awsClient = new LambdaAwsClientService(options);
    jest.spyOn(awsClient, 'getLambdaClient').mockResolvedValue(client);
    waitForActive = jest
      .spyOn(awsClient, 'waitFunctionActive')
      .mockResolvedValue();
    service = new LambdaToolFunctionsService(options, awsClient);
    jest
      .spyOn(service, 'ensureCommonLayerExists')
      .mockResolvedValue('existing-layer');
    jest.spyOn(TemporaryDirManager.prototype, 'init').mockResolvedValue({
      sourceTemporaryDir: '/tmp/builder-test',
      lambdaZipPath: '/tmp/builder-test.zip',
    });
    cleanup = jest
      .spyOn(TemporaryDirManager.prototype, 'clean')
      .mockResolvedValue();
    jest.spyOn(fs, 'readFile').mockResolvedValue(Buffer.from('zip'));
  });
  afterEach(() => jest.restoreAllMocks());
  it('uses existing layer and execution role, then waits before invoking a new builder', async () => {
    send
      .mockRejectedValueOnce(
        new ResourceNotFoundException({ message: 'missing', $metadata: {} }),
      )
      .mockResolvedValueOnce({});
    await service.ensureBuilderLambdaExists({
      functionName: 'workspace-builder',
      copyFiles,
    });
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetFunctionCommand);
    const command: CreateFunctionCommand = send.mock.calls[1][0];
    expect(command.input).toMatchObject({
      FunctionName: 'workspace-builder',
      Role: options.lambdaRole,
      Layers: ['existing-layer'],
      Handler: 'index.handler',
    });
    expect(copyFiles).toHaveBeenCalledWith('/tmp/builder-test');
    expect(waitForActive).toHaveBeenCalledWith('workspace-builder');
    expect(cleanup).toHaveBeenCalled();
  });
  it('waits when another first build wins the creation race', async () => {
    send
      .mockRejectedValueOnce(
        new ResourceNotFoundException({ message: 'missing', $metadata: {} }),
      )
      .mockRejectedValueOnce(
        new ResourceConflictException({
          message: 'already created',
          $metadata: {},
        }),
      );
    await expect(
      service.ensureBuilderLambdaExists({
        functionName: 'workspace-builder',
        copyFiles,
      }),
    ).resolves.toBeUndefined();
    expect(waitForActive).toHaveBeenCalledWith('workspace-builder');
    expect(cleanup).toHaveBeenCalled();
  });
  it('waits for an existing builder that is still being provisioned', async () => {
    send.mockResolvedValueOnce({ Configuration: { State: 'Pending' } });
    await service.ensureBuilderLambdaExists({
      functionName: 'workspace-builder',
      copyFiles,
    });
    expect(waitForActive).toHaveBeenCalledWith('workspace-builder');
    expect(copyFiles).not.toHaveBeenCalled();
  });
  it('does not hide unrelated deployment failures', async () => {
    send.mockRejectedValueOnce(new Error('Access denied'));
    await expect(
      service.ensureBuilderLambdaExists({
        functionName: 'workspace-builder',
        copyFiles,
      }),
    ).rejects.toThrow('Access denied');
    expect(copyFiles).not.toHaveBeenCalled();
  });
});
