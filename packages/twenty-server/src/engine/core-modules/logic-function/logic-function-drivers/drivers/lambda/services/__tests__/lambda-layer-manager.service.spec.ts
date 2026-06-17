import {
  DeleteLayerVersionCommand,
  ListLayerVersionsCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';

import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'app-universal-id';
const SDK_LAYER_NAME = `sdk-${WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}`;

const buildResourceNotFoundException = () =>
  new ResourceNotFoundException({
    message: 'not found',
    $metadata: {},
  });

describe('LambdaLayerManagerService - deleteSdkLayer', () => {
  let service: LambdaLayerManagerService;
  let send: jest.Mock;

  beforeEach(() => {
    send = jest.fn();

    const awsClient = {
      getLambdaClient: jest.fn().mockResolvedValue({ send }),
    } as unknown as LambdaAwsClientService;

    service = new LambdaLayerManagerService(
      { layerBucket: 'bucket' },
      awsClient,
      {} as unknown as LambdaToolFunctionsService,
      {} as unknown as LogicFunctionResourceService,
      {} as unknown as SdkClientArchiveService,
    );
  });

  it('should delete every version of the app SDK layer', async () => {
    send.mockImplementation((command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return Promise.resolve({
          LayerVersions: [{ Version: 1 }, { Version: 2 }],
          NextMarker: undefined,
        });
      }

      return Promise.resolve({});
    });

    await service.deleteSdkLayer({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const listCommands = send.mock.calls
      .map(([command]) => command)
      .filter(
        (command): command is ListLayerVersionsCommand =>
          command instanceof ListLayerVersionsCommand,
      );

    expect(listCommands).toHaveLength(1);
    expect(listCommands[0].input.LayerName).toBe(SDK_LAYER_NAME);

    const deleteCommands = send.mock.calls
      .map(([command]) => command)
      .filter(
        (command): command is DeleteLayerVersionCommand =>
          command instanceof DeleteLayerVersionCommand,
      );

    expect(deleteCommands).toHaveLength(2);
    expect(
      deleteCommands.map((command) => command.input.VersionNumber).sort(),
    ).toEqual([1, 2]);
    deleteCommands.forEach((command) => {
      expect(command.input.LayerName).toBe(SDK_LAYER_NAME);
    });
  });

  it('should never touch the shared deps layer', async () => {
    send.mockImplementation((command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return Promise.resolve({
          LayerVersions: [{ Version: 1 }],
          NextMarker: undefined,
        });
      }

      return Promise.resolve({});
    });

    await service.deleteSdkLayer({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const touchedLayerNames = send.mock.calls
      .map(([command]) => command.input?.LayerName)
      .filter(Boolean);

    expect(touchedLayerNames.length).toBeGreaterThan(0);
    touchedLayerNames.forEach((layerName: string) => {
      expect(layerName.startsWith('deps-')).toBe(false);
      expect(layerName).toBe(SDK_LAYER_NAME);
    });
  });

  it('should tolerate a missing layer on list (idempotent)', async () => {
    send.mockImplementation((command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return Promise.reject(buildResourceNotFoundException());
      }

      return Promise.resolve({});
    });

    await expect(
      service.deleteSdkLayer({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).resolves.toBeUndefined();

    expect(
      send.mock.calls.some(
        ([command]) => command instanceof DeleteLayerVersionCommand,
      ),
    ).toBe(false);
  });

  it('should tolerate a version already deleted concurrently', async () => {
    send.mockImplementation((command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return Promise.resolve({
          LayerVersions: [{ Version: 1 }],
          NextMarker: undefined,
        });
      }

      return Promise.reject(buildResourceNotFoundException());
    });

    await expect(
      service.deleteSdkLayer({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).resolves.toBeUndefined();
  });

  it('should rethrow unexpected errors', async () => {
    send.mockImplementation((command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return Promise.reject(new Error('boom'));
      }

      return Promise.resolve({});
    });

    await expect(
      service.deleteSdkLayer({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toThrow('boom');
  });
});
