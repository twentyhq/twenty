import { type Manifest } from 'twenty-shared/application';

import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { type ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { type ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { type ApplicationManifestExportService } from 'src/engine/core-modules/application/application-manifest/services/application-manifest-export.service';
import { type ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { type ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { type ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const OTHER_APPLICATION_ID = 'other-application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';

const MANIFEST = {
  application: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
} as unknown as Manifest;

const WORKSPACE_MIGRATION = {
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  actions: [],
};

describe('ApplicationDevelopmentService.syncApplication', () => {
  const applicationLookupService = { findByUniversalIdentifier: jest.fn() };
  const applicationSyncService = {
    synchronizeFromManifest: jest
      .fn()
      .mockResolvedValue({ workspaceMigration: WORKSPACE_MIGRATION }),
  };
  const applicationManifestApplyService = {
    applyManifestToWorkspace: jest
      .fn()
      .mockResolvedValue({ workspaceMigration: WORKSPACE_MIGRATION }),
    refreshRegistrationFromManifest: jest.fn().mockResolvedValue(false),
  };

  const service = new ApplicationDevelopmentService(
    {} as ApplicationService,
    applicationLookupService as unknown as ApplicationLookupService,
    applicationSyncService as unknown as ApplicationSyncService,
    applicationManifestApplyService as unknown as ApplicationManifestApplyService,
    {} as ApplicationManifestExportService,
    {
      findOneOwnedByWorkspaceOrThrow: jest
        .fn()
        .mockResolvedValue({ id: 'application-registration-id' }),
    } as unknown as ApplicationRegistrationLookupService,
    {} as ApplicationRegistrationAssetService,
    {
      validateWorkspaceCompatibility: jest
        .fn()
        .mockResolvedValue({ compatible: true }),
    } as unknown as ApplicationVersionValidationService,
    {} as FileStorageService,
    {
      tokenBucketThrottleOrThrow: jest.fn(),
    } as unknown as ThrottlerService,
    {
      withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
    } as unknown as CacheLockService,
  );

  const sync = async ({
    applicationId,
    inferDeletionFromMissingEntities,
    dryRun,
  }: {
    applicationId: string;
    inferDeletionFromMissingEntities?: boolean;
    dryRun: boolean;
  }) => {
    applicationLookupService.findByUniversalIdentifier.mockResolvedValue({
      id: applicationId,
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    await service.syncApplication({
      manifest: MANIFEST,
      dryRun,
      inferDeletionFromMissingEntities,
      workspaceId: WORKSPACE_ID,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });

    const [[options]] = dryRun
      ? applicationSyncService.synchronizeFromManifest.mock.calls
      : applicationManifestApplyService.applyManifestToWorkspace.mock.calls;

    return options.inferDeletionFromMissingEntities;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([true, false])('with dryRun %s', (dryRun) => {
    it.each([
      [WORKSPACE_CUSTOM_APPLICATION_ID, undefined, false],
      [WORKSPACE_CUSTOM_APPLICATION_ID, true, true],
      [WORKSPACE_CUSTOM_APPLICATION_ID, false, false],
      [OTHER_APPLICATION_ID, undefined, true],
      [OTHER_APPLICATION_ID, false, false],
    ])(
      'syncs application %s with inferDeletionFromMissingEntities %s as %s',
      async (applicationId, inferDeletionFromMissingEntities, expected) => {
        expect(
          await sync({
            applicationId,
            inferDeletionFromMissingEntities,
            dryRun,
          }),
        ).toBe(expected);
      },
    );
  });

  it('infers deletion for an application not installed yet', async () => {
    applicationLookupService.findByUniversalIdentifier.mockResolvedValue(null);

    await service.syncApplication({
      manifest: MANIFEST,
      dryRun: true,
      workspaceId: WORKSPACE_ID,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });

    expect(applicationSyncService.synchronizeFromManifest).toHaveBeenCalledWith(
      expect.objectContaining({ inferDeletionFromMissingEntities: true }),
    );
  });
});
