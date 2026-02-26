import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { AppRegistrationIdentifierGuardService } from 'src/engine/core-modules/app-registration/app-registration-identifier-guard.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

describe('AppRegistrationIdentifierGuardService', () => {
  let service: AppRegistrationIdentifierGuardService;
  let appRegistrationRepository: jest.Mocked<
    Repository<AppRegistrationEntity>
  >;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRegistrationIdentifierGuardService,
        {
          provide: getRepositoryToken(AppRegistrationEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AppRegistrationIdentifierGuardService);
    appRegistrationRepository = module.get(
      getRepositoryToken(AppRegistrationEntity),
    );
    applicationRepository = module.get(
      getRepositoryToken(ApplicationEntity),
    );
  });

  it('should allow when application has no appRegistrationId (grandfather policy)', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      appRegistrationId: null,
    } as ApplicationEntity);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'some-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(true);
  });

  it('should allow when identifier is not claimed by any registration', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      appRegistrationId: 'reg-1',
    } as ApplicationEntity);

    appRegistrationRepository.findOne.mockResolvedValue(null);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'unclaimed-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(true);
  });

  it('should allow when identifier is claimed by the same registration', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      appRegistrationId: 'reg-1',
    } as ApplicationEntity);

    appRegistrationRepository.findOne.mockResolvedValue({
      id: 'reg-1',
      universalIdentifier: 'my-uid',
      name: 'My App',
    } as AppRegistrationEntity);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'my-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(true);
  });

  it('should reject when identifier is claimed by a different registration', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      appRegistrationId: 'reg-1',
      name: 'My App',
    } as ApplicationEntity);

    appRegistrationRepository.findOne.mockResolvedValue({
      id: 'reg-2',
      universalIdentifier: 'stolen-uid',
      name: 'Other App',
    } as AppRegistrationEntity);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'stolen-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('claimed by');
  });
});
