import { Test } from '@nestjs/testing';

import { Readable } from 'stream';

import {
  type ApplicationCapability,
  type Manifest,
} from 'twenty-shared/application';

import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

describe('ApplicationSyncService media capabilities', () => {
  let service: ApplicationSyncService;

  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    applicationService.update.mockResolvedValue({
      applicationRegistrationId: null,
    });

    const module = await Test.createTestingModule({
      providers: [ApplicationSyncService],
    })
      .useMocker((token) => {
        if (token === ApplicationService) {
          return applicationService;
        }

        if (token === FileStorageService) {
          return {
            readFile: jest.fn(() =>
              Readable.from([
                Buffer.from(JSON.stringify({ version: '1.2.0' })),
              ]),
            ),
          };
        }

        if (token === ApplicationManifestMigrationService) {
          return {
            syncMetadataFromManifest: jest.fn().mockResolvedValue({
              workspaceMigration: { actions: [] },
              hasSchemaMetadataChanged: false,
            }),
          };
        }

        return {};
      })
      .compile();

    service = module.get(ApplicationSyncService);
  });

  it.each<{
    behavior: string;
    sourceType: ApplicationRegistrationSourceType;
    grantedCapabilities: ApplicationCapability[];
    requestedCapabilities?: ApplicationCapability[];
    expectedGrantedCapabilities: ApplicationCapability[];
  }>([
    {
      behavior: 'does not grant additional permissions on package updates',
      sourceType: ApplicationRegistrationSourceType.NPM,
      grantedCapabilities: ['microphone'],
      requestedCapabilities: ['microphone', 'camera'],
      expectedGrantedCapabilities: ['microphone'],
    },
    {
      behavior: 'preserves workspace-approved access when declarations change',
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      grantedCapabilities: ['microphone', 'camera'],
      requestedCapabilities: ['camera'],
      expectedGrantedCapabilities: ['microphone', 'camera'],
    },
    {
      behavior: 'preserves runtime approval for legacy manifests',
      sourceType: ApplicationRegistrationSourceType.NPM,
      grantedCapabilities: ['microphone'],
      expectedGrantedCapabilities: ['microphone'],
    },
    {
      behavior: 'allows workspace-owned development apps to sync permissions',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      grantedCapabilities: [],
      requestedCapabilities: ['microphone', 'camera'],
      expectedGrantedCapabilities: ['microphone', 'camera'],
    },
  ])(
    '$behavior',
    async ({
      sourceType,
      grantedCapabilities,
      requestedCapabilities,
      expectedGrantedCapabilities,
    }) => {
      applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
        {
          id: 'application-id',
          sourceType,
          grantedCapabilities,
          applicationRegistrationId: null,
          frontComponentSharedDependenciesChecksum: null,
        },
      );

      await service.synchronizeFromManifest({
        workspaceId: 'workspace-id',
        manifest: {
          application: {
            universalIdentifier: 'application-identifier',
            displayName: 'Recording app',
            requestedCapabilities,
          },
        } as Manifest,
      });

      expect(applicationService.update).toHaveBeenCalledWith(
        'application-id',
        expect.objectContaining({
          grantedCapabilities: expectedGrantedCapabilities,
        }),
      );
    },
  );
});
