import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';

describe('ApplicationRegistrationAssetService - asset broadcast', () => {
  let service: ApplicationRegistrationAssetService;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let applicationRegistrationService: {
    broadcastApplicationRegistrationUpdatedById: jest.Mock;
  };

  const APPLICATION_REGISTRATION_ID = 'registration-id';

  const manifestApplication = {
    logo: 'assets/logo.png',
  } as never;

  // Storage validates the bytes, so a real (1x1) PNG is needed for the write
  // path to produce a fileId rather than fall back to the previous one
  const readAsset = jest
    .fn()
    .mockResolvedValue(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    );

  beforeEach(async () => {
    applicationRegistrationRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    applicationRegistrationService = {
      broadcastApplicationRegistrationUpdatedById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationAssetService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: ServerFileStorageService,
          useValue: {
            writeServerFile: jest
              .fn()
              .mockResolvedValue({ id: 'stored-logo-file-id' }),
            findServerFile: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: applicationRegistrationService,
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationAssetService);
  });

  it('broadcasts once the stored assets differ from the row written before them', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: APPLICATION_REGISTRATION_ID,
      logoFileId: null,
      galleryImages: [],
    });

    await service.storeRegistrationAssets({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      manifestApplication,
      readAsset,
    });

    expect(
      applicationRegistrationService.broadcastApplicationRegistrationUpdatedById,
    ).toHaveBeenCalledWith(APPLICATION_REGISTRATION_ID);
  });

  it('does not broadcast when the asset write leaves the row unchanged', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: APPLICATION_REGISTRATION_ID,
      logoFileId: 'stored-logo-file-id',
      galleryImages: [],
    });

    await service.storeRegistrationAssets({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      manifestApplication,
      readAsset,
    });

    expect(
      applicationRegistrationService.broadcastApplicationRegistrationUpdatedById,
    ).not.toHaveBeenCalled();
  });
});
