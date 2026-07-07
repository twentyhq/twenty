import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationManifestStorageService } from 'src/engine/core-modules/application/application-registration/application-manifest-storage.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('ApplicationRegistrationService.getManifest', () => {
  let service: ApplicationRegistrationService;
  let applicationManifestStorageService: jest.Mocked<ApplicationManifestStorageService>;

  const manifestFileId = 'b4e9f0a1-5678-4c6d-9e7f-8a9b0c1d2e3f';

  const manifestFromStorage = {
    application: { displayName: 'From Storage' },
  } as unknown as Manifest;

  const manifestFromColumn = {
    application: { displayName: 'From Column' },
  } as unknown as Manifest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {},
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: {},
        },
        {
          provide: CacheLockService,
          useValue: {},
        },
        {
          provide: ApplicationManifestStorageService,
          useValue: {
            writeManifest: jest.fn(),
            readManifest: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationService);
    applicationManifestStorageService = module.get(
      ApplicationManifestStorageService,
    );

    jest.clearAllMocks();
  });

  it('should return the manifest from storage when a manifest file id is set', async () => {
    applicationManifestStorageService.readManifest.mockResolvedValue(
      manifestFromStorage,
    );

    const registration = {
      manifestFileId,
      manifest: manifestFromColumn,
    } as ApplicationRegistrationEntity;

    await expect(service.getManifest(registration)).resolves.toEqual(
      manifestFromStorage,
    );
    expect(applicationManifestStorageService.readManifest).toHaveBeenCalledWith(
      manifestFileId,
    );
  });

  it('should fall back to the database column when the manifest file is missing', async () => {
    applicationManifestStorageService.readManifest.mockResolvedValue(null);

    const registration = {
      manifestFileId,
      manifest: manifestFromColumn,
    } as ApplicationRegistrationEntity;

    await expect(service.getManifest(registration)).resolves.toEqual(
      manifestFromColumn,
    );
  });

  it('should fall back to the database column when the storage read throws', async () => {
    applicationManifestStorageService.readManifest.mockRejectedValue(
      new Error('storage unavailable'),
    );

    const registration = {
      manifestFileId,
      manifest: manifestFromColumn,
    } as ApplicationRegistrationEntity;

    await expect(service.getManifest(registration)).resolves.toEqual(
      manifestFromColumn,
    );
  });

  it('should return the database column manifest when no manifest file id is set', async () => {
    const registration = {
      manifestFileId: null,
      manifest: manifestFromColumn,
    } as ApplicationRegistrationEntity;

    await expect(service.getManifest(registration)).resolves.toEqual(
      manifestFromColumn,
    );
    expect(
      applicationManifestStorageService.readManifest,
    ).not.toHaveBeenCalled();
  });

  it('should return null when neither a manifest file id nor a column manifest exists', async () => {
    const registration = {
      manifestFileId: null,
      manifest: null,
    } as ApplicationRegistrationEntity;

    await expect(service.getManifest(registration)).resolves.toBeNull();
  });
});
