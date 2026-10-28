import {
  type GetFunctionCommandOutput,
  type PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import { EMPTY_YARN_LOCK_CONTENT } from 'twenty-shared/application';

import { type ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/workspace-custom-application-dependencies-directory-name';
import {
  type DefaultApplicationPackageFields,
  getDefaultApplicationPackageFields,
} from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { getLambdaLayerNameFromArn } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-layer-name-from-arn.util';
import { sanitizeApplicationPackageJson } from 'src/engine/core-modules/logic-function/logic-function-resource/utils/sanitize-application-package-json.util';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000002';
const WORKSPACE_CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-000000000003';
const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-0000-0000-00000000000a';
const YARN_LOCK_CHECKSUM = '0123456789abcdef0123456789abcdef';
const PACKAGE_JSON_CHECKSUM = 'fedcba9876543210fedcba9876543210';
const APPLICATION_PACKAGE_JSON = '{"name":"app","scripts":{"postinstall":"x"}}';
const APPLICATION_YARN_LOCK = '# application yarn.lock\n';

const toLayerArn = (layerName: string) =>
  `arn:aws:lambda:eu-central-1:000000000000:layer:${layerName}:1`;

const SDK_LAYER_ARN = toLayerArn(
  `sdk-${WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
);
const V1_LAYER_ARN = toLayerArn(
  `depsv1-ns123-${APPLICATION_UNIVERSAL_IDENTIFIER}-${YARN_LOCK_CHECKSUM}`,
);
const NOLOCK_V1_LAYER_ARN = toLayerArn(
  `depsv1-ns123-${APPLICATION_UNIVERSAL_IDENTIFIER}-nolock-${PACKAGE_JSON_CHECKSUM}`,
);
const LEGACY_LAYER_ARN = toLayerArn(`deps-ns123-${YARN_LOCK_CHECKSUM}`);
const LEGACY_DEFAULT_LAYER_ARN = toLayerArn('deps-ns123-default');

const toWorkspaceCustomLayerArn = (yarnLockChecksum: string) =>
  toLayerArn(`depsv1-ns123-custom-${yarnLockChecksum}`);

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    id: APPLICATION_ID,
    workspaceId: WORKSPACE_ID,
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    packageJsonChecksum: PACKAGE_JSON_CHECKSUM,
    yarnLockChecksum: YARN_LOCK_CHECKSUM,
    sdkClientCoreChecksum: null,
    ...overrides,
  }) as FlatApplication;

const buildLambdaExecutor = (layerArns: string[]) =>
  ({
    Configuration: { Layers: layerArns.map((layerArn) => ({ Arn: layerArn })) },
  }) as GetFunctionCommandOutput;

const buildLayerManager = ({
  existingLayerArns = [],
  yarnLockContent = APPLICATION_YARN_LOCK,
}: {
  existingLayerArns?: string[];
  yarnLockContent?: string | null;
} = {}) => {
  const layerArns = [...existingLayerArns];

  const awsClient = {
    getExistingLayerArn: jest.fn(async (layerName: string) =>
      layerArns.find(
        (layerArn) => getLambdaLayerNameFromArn(layerArn) === layerName,
      ),
    ),
    generatePresignedUploadUrl: jest.fn(async () => 'https://upload.test'),
    getLambdaClient: jest.fn(async () => ({
      send: jest.fn(async ({ input }: PublishLayerVersionCommand) => {
        const layerArn = toLayerArn(input.LayerName ?? '');

        layerArns.push(layerArn);

        return { LayerVersionArn: layerArn };
      }),
    })),
  };
  const toolFunctions = { runYarnInstallCreateLayer: jest.fn() };
  const applicationDependencyFilesService = {
    getVerifiedDependencyContentsOrThrow: jest.fn(async () => ({
      packageJsonContent: APPLICATION_PACKAGE_JSON,
      yarnLockContent,
    })),
  };
  const coreEntityCacheService = {
    get: jest.fn(async () => ({
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    })),
  };

  const layerManager = new LambdaLayerManagerService(
    { layerBucket: 'layer-bucket', resourceNamespace: 'ns123' },
    awsClient as unknown as LambdaAwsClientService,
    toolFunctions as unknown as LambdaToolFunctionsService,
    applicationDependencyFilesService as unknown as ApplicationDependencyFilesService,
    {} as SdkClientArchiveService,
    {
      withLock: async (callback: () => Promise<string>) => callback(),
    } as unknown as CacheLockService,
    {} as WorkspaceCacheService,
    coreEntityCacheService as unknown as CoreEntityCacheService,
  );

  return { layerManager, toolFunctions, applicationDependencyFilesService };
};

describe('LambdaLayerManagerService', () => {
  let workspaceCustomDefaults: DefaultApplicationPackageFields;

  beforeAll(async () => {
    workspaceCustomDefaults = await getDefaultApplicationPackageFields({
      directory: WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    });
  });

  describe('ensureDepsLayer', () => {
    it('builds the layer of an application from its verified files', async () => {
      const { layerManager, toolFunctions } = buildLayerManager();

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(V1_LAYER_ARN);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledTimes(1);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          packageJson: sanitizeApplicationPackageJson(APPLICATION_PACKAGE_JSON),
          yarnLock: APPLICATION_YARN_LOCK,
        }),
      );
    });

    it('builds the layer of an application without a yarn.lock from its package.json', async () => {
      const { layerManager, toolFunctions } = buildLayerManager({
        yarnLockContent: null,
      });

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication({ yarnLockChecksum: null }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(NOLOCK_V1_LAYER_ARN);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledTimes(1);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledWith(
        expect.objectContaining({ yarnLock: EMPTY_YARN_LOCK_CONTENT }),
      );
    });

    it('refuses to build a layer named after a yarn.lock that is not stored', async () => {
      const { layerManager, toolFunctions } = buildLayerManager({
        yarnLockContent: null,
      });

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).rejects.toThrow(ApplicationException);
      expect(toolFunctions.runYarnInstallCreateLayer).not.toHaveBeenCalled();
    });

    it('uses the layer shared by workspace custom applications when it exists', async () => {
      const workspaceCustomLayerArn =
        toWorkspaceCustomLayerArn(YARN_LOCK_CHECKSUM);
      const { layerManager, toolFunctions } = buildLayerManager({
        existingLayerArns: [workspaceCustomLayerArn],
      });

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication({
            id: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(workspaceCustomLayerArn);
      expect(toolFunctions.runYarnInstallCreateLayer).not.toHaveBeenCalled();
    });

    it('builds the shared layer from the server defaults when a workspace custom application is on them', async () => {
      const { layerManager, toolFunctions, applicationDependencyFilesService } =
        buildLayerManager();

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication({
            id: WORKSPACE_CUSTOM_APPLICATION_ID,
            yarnLockChecksum: workspaceCustomDefaults.yarnLockChecksum,
          }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(
        toWorkspaceCustomLayerArn(workspaceCustomDefaults.yarnLockChecksum),
      );
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledTimes(1);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          packageJson: sanitizeApplicationPackageJson(
            workspaceCustomDefaults.packageJsonContent,
          ),
          yarnLock: workspaceCustomDefaults.yarnLockContent,
        }),
      );
      expect(
        applicationDependencyFilesService.getVerifiedDependencyContentsOrThrow,
      ).not.toHaveBeenCalled();
    });

    it('builds a layer of its own for a workspace custom application off the server defaults', async () => {
      const { layerManager } = buildLayerManager();

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication({
            id: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(V1_LAYER_ARN);
    });

    it('never gives the shared layer to another application', async () => {
      const workspaceCustomLayerArn = toWorkspaceCustomLayerArn(
        workspaceCustomDefaults.yarnLockChecksum,
      );
      const { layerManager } = buildLayerManager({
        existingLayerArns: [workspaceCustomLayerArn],
      });

      await expect(
        layerManager.ensureDepsLayer({
          flatApplication: buildFlatApplication({
            yarnLockChecksum: workspaceCustomDefaults.yarnLockChecksum,
          }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(
        toLayerArn(
          `depsv1-ns123-${APPLICATION_UNIVERSAL_IDENTIFIER}-${workspaceCustomDefaults.yarnLockChecksum}`,
        ),
      );
    });
  });

  describe('resolveDepsLayerArn', () => {
    it('keeps a function on the legacy layer of its yarn.lock until its v1 layer exists', async () => {
      const { layerManager, toolFunctions } = buildLayerManager({
        existingLayerArns: [LEGACY_LAYER_ARN],
      });

      await expect(
        layerManager.resolveDepsLayerArn({
          lambdaExecutor: buildLambdaExecutor([
            LEGACY_LAYER_ARN,
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(LEGACY_LAYER_ARN);
      expect(toolFunctions.runYarnInstallCreateLayer).not.toHaveBeenCalled();
    });

    it('moves a function to its v1 layer once it exists', async () => {
      const { layerManager } = buildLayerManager({
        existingLayerArns: [LEGACY_LAYER_ARN, V1_LAYER_ARN],
      });

      await expect(
        layerManager.resolveDepsLayerArn({
          lambdaExecutor: buildLambdaExecutor([
            LEGACY_LAYER_ARN,
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(V1_LAYER_ARN);
    });

    it('keeps an application without a yarn.lock on the legacy default layer until its v1 layer exists', async () => {
      const { layerManager, toolFunctions } = buildLayerManager({
        existingLayerArns: [LEGACY_DEFAULT_LAYER_ARN],
        yarnLockContent: null,
      });

      await expect(
        layerManager.resolveDepsLayerArn({
          lambdaExecutor: buildLambdaExecutor([
            LEGACY_DEFAULT_LAYER_ARN,
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication({ yarnLockChecksum: null }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(LEGACY_DEFAULT_LAYER_ARN);
      expect(toolFunctions.runYarnInstallCreateLayer).not.toHaveBeenCalled();
    });

    it('moves an application without a yarn.lock off a legacy layer named after another yarn.lock', async () => {
      const { layerManager, toolFunctions } = buildLayerManager({
        existingLayerArns: [LEGACY_LAYER_ARN],
        yarnLockContent: null,
      });

      await expect(
        layerManager.resolveDepsLayerArn({
          lambdaExecutor: buildLambdaExecutor([
            LEGACY_LAYER_ARN,
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication({ yarnLockChecksum: null }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(NOLOCK_V1_LAYER_ARN);
      expect(toolFunctions.runYarnInstallCreateLayer).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasExpectedLayers', () => {
    it('accepts a function still on the legacy layer of its yarn.lock', async () => {
      const { layerManager } = buildLayerManager();

      await expect(
        layerManager.hasExpectedLayers({
          lambdaExecutor: buildLambdaExecutor([
            LEGACY_LAYER_ARN,
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(true);
    });

    it('refuses a legacy layer built for another yarn.lock', async () => {
      const { layerManager } = buildLayerManager();

      await expect(
        layerManager.hasExpectedLayers({
          lambdaExecutor: buildLambdaExecutor([
            toLayerArn('deps-ns123-fedcba9876543210fedcba9876543210'),
            SDK_LAYER_ARN,
          ]),
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(false);
    });

    it('accepts the shared layer for the workspace custom application only', async () => {
      const { layerManager } = buildLayerManager();
      const lambdaExecutor = buildLambdaExecutor([
        toWorkspaceCustomLayerArn(YARN_LOCK_CHECKSUM),
        SDK_LAYER_ARN,
      ]);

      await expect(
        layerManager.hasExpectedLayers({
          lambdaExecutor,
          flatApplication: buildFlatApplication({
            id: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(true);
      await expect(
        layerManager.hasExpectedLayers({
          lambdaExecutor,
          flatApplication: buildFlatApplication(),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).resolves.toBe(false);
    });
  });
});
