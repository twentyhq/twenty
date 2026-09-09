import {
  DeleteLayerVersionCommand,
  ListLayerVersionsCommand,
  PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/reprefix-lambda-zip-entries.util',
  () => ({
    reprefixLambdaZipEntries: jest.fn(async ({ sourceBuffer }) => sourceBuffer),
  }),
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000002';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'test-app';

describe('LambdaLayerManagerService.ensureSdkLayer', () => {
  let flatApplication: FlatApplication;
  let publishedVersion: number;
  let liveVersions: number[];
  let publishInFlight: Promise<void>;
  let resolvePublish: () => void;

  const send = jest.fn();
  const awsClient = {
    getLambdaClient: async () => ({ send }),
    getExistingLayerArn: jest.fn(async (layerName: string) =>
      liveVersions.length > 0
        ? `arn:${layerName}:${liveVersions[liveVersions.length - 1]}`
        : undefined,
    ),
  };
  const sdkClientArchiveService = {
    downloadArchiveBuffer: jest.fn(async () => Buffer.from('zip')),
    markSdkLayerFresh: jest.fn(async () => {
      flatApplication = { ...flatApplication, isSdkLayerStale: false };
    }),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn(async () => ({
      flatApplicationMaps: { byId: { [APPLICATION_ID]: flatApplication } },
    })),
  };
  const lockChains = new Map<string, Promise<unknown>>();
  const cacheLockService = {
    withLock: jest.fn(async <T>(fn: () => Promise<T>, key: string) => {
      const previous = lockChains.get(key) ?? Promise.resolve();
      const run = previous.then(fn, fn);

      lockChains.set(
        key,
        run.catch(() => undefined),
      );

      return run;
    }),
  };

  const buildService = () =>
    new LambdaLayerManagerService(
      { layerBucket: 'bucket', resourceNamespace: 'test' },
      awsClient as unknown as LambdaAwsClientService,
      {} as LambdaToolFunctionsService,
      {} as LogicFunctionResourceService,
      sdkClientArchiveService as unknown as SdkClientArchiveService,
      cacheLockService as unknown as CacheLockService,
      workspaceCacheService as unknown as WorkspaceCacheService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    lockChains.clear();
    flatApplication = {
      id: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      isSdkLayerStale: true,
    } as FlatApplication;
    publishedVersion = 0;
    liveVersions = [1];
    publishInFlight = new Promise((resolve) => {
      resolvePublish = resolve;
    });

    send.mockImplementation(async (command) => {
      if (command instanceof ListLayerVersionsCommand) {
        return {
          LayerVersions: liveVersions.map((version) => ({ Version: version })),
        };
      }

      if (command instanceof DeleteLayerVersionCommand) {
        liveVersions = liveVersions.filter(
          (version) => version !== command.input.VersionNumber,
        );

        return {};
      }

      if (command instanceof PublishLayerVersionCommand) {
        await publishInFlight;
        publishedVersion += 1;
        liveVersions = [...liveVersions, publishedVersion + 1];

        return {
          LayerVersionArn: `arn:${command.input.LayerName}:${publishedVersion + 1}`,
        };
      }

      throw new Error(`Unexpected command ${command.constructor.name}`);
    });
  });

  it('returns the existing layer without touching AWS when the layer is fresh', async () => {
    flatApplication = { ...flatApplication, isSdkLayerStale: false };

    const arn = await buildService().ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(arn).toMatch(/:1$/);
    expect(send).not.toHaveBeenCalled();
    expect(cacheLockService.withLock).not.toHaveBeenCalled();
  });

  it('publishes the stale layer once when two functions of the application build concurrently', async () => {
    const service = buildService();
    const context = {
      flatApplication,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    };

    const firstBuild = service.ensureSdkLayer(context);
    const secondBuild = service.ensureSdkLayer(context);

    resolvePublish();

    const [firstArn, secondArn] = await Promise.all([firstBuild, secondBuild]);

    expect(firstArn).toBe(secondArn);
    expect(
      send.mock.calls.filter(
        ([command]) => command instanceof PublishLayerVersionCommand,
      ),
    ).toHaveLength(1);
    expect(
      send.mock.calls.filter(
        ([command]) => command instanceof DeleteLayerVersionCommand,
      ),
    ).toHaveLength(1);
    expect(sdkClientArchiveService.markSdkLayerFresh).toHaveBeenCalledTimes(1);
    expect(cacheLockService.withLock).toHaveBeenCalledTimes(2);
    expect(cacheLockService.withLock.mock.calls[0][1]).toBe(
      cacheLockService.withLock.mock.calls[1][1],
    );
  });
});
