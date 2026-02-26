import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationIdentifierGuardService } from 'src/engine/core-modules/application-registration/application-registration-identifier-guard.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

describe('ApplicationRegistrationIdentifierGuardService', () => {
  let service: ApplicationRegistrationIdentifierGuardService;
  let applicationRegistrationRepository: jest.Mocked<
    Repository<ApplicationRegistrationEntity>
  >;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationIdentifierGuardService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
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

    service = module.get(ApplicationRegistrationIdentifierGuardService);
    applicationRegistrationRepository = module.get(
      getRepositoryToken(ApplicationRegistrationEntity),
    );
    applicationRepository = module.get(getRepositoryToken(ApplicationEntity));
  });

  it('should allow when application has no applicationRegistrationId (grandfather policy)', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      applicationRegistrationId: null,
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
      applicationRegistrationId: 'reg-1',
    } as ApplicationEntity);

    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'unclaimed-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(true);
  });

  it('should allow when identifier is claimed by the same registration', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      applicationRegistrationId: 'reg-1',
    } as ApplicationEntity);

    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: 'reg-1',
      universalIdentifier: 'my-uid',
      name: 'My App',
    } as ApplicationRegistrationEntity);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'my-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(true);
  });

  it('should reject when identifier is claimed by a different registration', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'app-1',
      applicationRegistrationId: 'reg-1',
      name: 'My App',
    } as ApplicationEntity);

    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: 'reg-2',
      universalIdentifier: 'stolen-uid',
      name: 'Other App',
    } as ApplicationRegistrationEntity);

    const result = await service.validateUniversalIdentifierOwnership({
      universalIdentifier: 'stolen-uid',
      applicationId: 'app-1',
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('claimed by');
  });
});
