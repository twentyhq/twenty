import {
  DeleteFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaExecutorManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-executor-manager.service';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FUNCTION_ID = 'logic-function-id';

const flatLogicFunction = {
  id: FUNCTION_ID,
  workspaceId: 'workspace-id',
} as unknown as FlatLogicFunction;

describe('LambdaExecutorManagerService - delete', () => {
  let service: LambdaExecutorManagerService;
  let send: jest.Mock;

  beforeEach(() => {
    send = jest.fn();

    const awsClient = {
      getLambdaClient: jest.fn().mockResolvedValue({ send }),
    } as unknown as LambdaAwsClientService;

    service = new LambdaExecutorManagerService(
      { lambdaRole: 'role' },
      awsClient,
      {} as unknown as LambdaLayerManagerService,
      {} as unknown as CacheLockService,
      {} as unknown as LogicFunctionResourceService,
      {} as unknown as WorkspaceCacheService,
    );
  });

  it('should issue DeleteFunctionCommand with the function id when it exists', async () => {
    send.mockImplementation((command) => {
      if (command instanceof GetFunctionCommand) {
        return Promise.resolve({ Configuration: { State: 'Active' } });
      }

      return Promise.resolve({});
    });

    await service.delete(flatLogicFunction);

    const deleteCommands = send.mock.calls
      .map(([command]) => command)
      .filter(
        (command): command is DeleteFunctionCommand =>
          command instanceof DeleteFunctionCommand,
      );

    expect(deleteCommands).toHaveLength(1);
    expect(deleteCommands[0].input.FunctionName).toBe(FUNCTION_ID);
  });

  it('should tolerate an already-deleted function (ResourceNotFoundException)', async () => {
    send.mockImplementation((command) => {
      if (command instanceof GetFunctionCommand) {
        return Promise.reject(
          new ResourceNotFoundException({ message: 'gone', $metadata: {} }),
        );
      }

      return Promise.resolve({});
    });

    await expect(service.delete(flatLogicFunction)).resolves.toBeUndefined();

    expect(
      send.mock.calls.some(
        ([command]) => command instanceof DeleteFunctionCommand,
      ),
    ).toBe(false);
  });
});
