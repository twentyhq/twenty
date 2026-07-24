import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationBillingCacheProviderService } from 'src/engine/core-modules/application/application-registration/application-registration-billing-cache-provider.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

describe('ApplicationRegistrationBillingCacheProviderService', () => {
  let provider: ApplicationRegistrationBillingCacheProviderService;
  let repository: { findOne: jest.Mock };

  beforeEach(async () => {
    repository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationBillingCacheProviderService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: repository,
        },
      ],
    }).compile();

    provider = module.get(ApplicationRegistrationBillingCacheProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when the registration is billing-exempt', async () => {
    repository.findOne.mockResolvedValue({
      id: 'registration-id',
      hasFreeLogicFunctionExecutions: true,
    });

    await expect(provider.computeForCache('registration-id')).resolves.toBe(
      true,
    );
  });

  it('should return false when the registration is not billing-exempt', async () => {
    repository.findOne.mockResolvedValue({
      id: 'registration-id',
      hasFreeLogicFunctionExecutions: false,
    });

    await expect(provider.computeForCache('registration-id')).resolves.toBe(
      false,
    );
  });

  it('should return null when the registration does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(provider.computeForCache('missing-id')).resolves.toBeNull();
  });
});
