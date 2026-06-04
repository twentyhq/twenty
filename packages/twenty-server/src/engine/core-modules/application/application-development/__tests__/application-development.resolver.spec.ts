jest.mock('graphql-upload/GraphQLUpload.mjs', () => ({
  __esModule: true,
  default: class GraphQLUpload {},
}));

import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { ApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/application.input';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACE_ID = 'workspace-1';
const UNIVERSAL_IDENTIFIER = 'app-uid-1';

const buildManifest = (): ApplicationInput['manifest'] =>
  ({
    application: {
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      displayName: 'Demo App',
    },
  }) as unknown as ApplicationInput['manifest'];

describe('ApplicationDevelopmentResolver', () => {
  let resolver: ApplicationDevelopmentResolver;
  let withLock: jest.Mock;
  let synchronizeFromManifest: jest.Mock;

  beforeEach(() => {
    withLock = jest.fn((fn: () => Promise<unknown>) => fn());

    synchronizeFromManifest = jest.fn().mockResolvedValue({
      workspaceMigration: {
        applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
        actions: [],
      },
      hasSchemaMetadataChanged: false,
    });

    const cacheLockService = {
      withLock,
    } as unknown as CacheLockService;

    const applicationSyncService = {
      synchronizeFromManifest,
    } as unknown as ApplicationSyncService;

    const applicationService = {
      findByUniversalIdentifier: jest.fn().mockResolvedValue({
        id: 'application-1',
        version: '1.0.0',
        universalIdentifier: UNIVERSAL_IDENTIFIER,
      }),
    } as unknown as ApplicationService;

    const applicationRegistrationService = {
      findOneByUniversalIdentifier: jest
        .fn()
        .mockResolvedValue({ id: 'registration-1' }),
      updateFromManifest: jest.fn(),
    } as unknown as ApplicationRegistrationService;

    const sdkClientGenerationService = {
      generateSdkClientForApplication: jest.fn(),
    } as unknown as SdkClientGenerationService;

    const twentyConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    } as unknown as TwentyConfigService;

    const throttlerService = {
      tokenBucketThrottleOrThrow: jest.fn(),
    } as unknown as ThrottlerService;

    resolver = new ApplicationDevelopmentResolver(
      {} as unknown as ApplicationTokenService,
      applicationService,
      applicationSyncService,
      applicationRegistrationService,
      {} as unknown as ApplicationRegistrationVariableService,
      {} as unknown as FileStorageService,
      sdkClientGenerationService,
      twentyConfigService,
      throttlerService,
      cacheLockService,
    );
  });

  it('runs the manifest sync inside a per-workspace cache lock', async () => {
    await resolver.syncApplication({ manifest: buildManifest() }, {
      id: WORKSPACE_ID,
    } as WorkspaceEntity);

    expect(withLock).toHaveBeenCalledWith(
      expect.any(Function),
      `app-sync:${WORKSPACE_ID}`,
      expect.any(Object),
    );
    expect(synchronizeFromManifest).toHaveBeenCalledTimes(1);
  });

  it('does not run the manifest sync when the lock body is not executed', async () => {
    withLock.mockResolvedValue({
      applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
      actions: [],
    });

    await resolver.syncApplication({ manifest: buildManifest() }, {
      id: WORKSPACE_ID,
    } as WorkspaceEntity);

    expect(synchronizeFromManifest).not.toHaveBeenCalled();
  });
});
