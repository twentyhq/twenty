import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { OnboardingSlackAvailabilityService } from 'src/engine/core-modules/onboarding/services/onboarding-slack-availability.service';

const buildRegistration = (
  manifest: unknown,
): Partial<ApplicationRegistrationEntity> => ({
  id: 'registration-id',
  manifest: manifest as ApplicationRegistrationEntity['manifest'],
});

const SLACK_MANIFEST = {
  connectionProviders: [
    {
      name: 'slack',
      type: 'oauth',
      oauth: {
        clientIdVariable: 'SLACK_CLIENT_ID',
        clientSecretVariable: 'SLACK_CLIENT_SECRET',
      },
    },
  ],
};

describe('OnboardingSlackAvailabilityService', () => {
  let service: OnboardingSlackAvailabilityService;
  let registrationRepository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationEntity>, 'findOneBy'>
  >;
  let connectionProviderService: jest.Mocked<
    Pick<
      ConnectionProviderService,
      'areRegistrationClientCredentialsConfigured'
    >
  >;

  beforeEach(async () => {
    registrationRepository = { findOneBy: jest.fn() };
    connectionProviderService = {
      areRegistrationClientCredentialsConfigured: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingSlackAvailabilityService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: registrationRepository,
        },
        {
          provide: ConnectionProviderService,
          useValue: connectionProviderService,
        },
      ],
    }).compile();

    service = module.get(OnboardingSlackAvailabilityService);
  });

  it('should not be available when the Slack app is not registered on the instance', async () => {
    registrationRepository.findOneBy.mockResolvedValue(null);

    expect(await service.isSlackConnectAvailable()).toBe(false);
    expect(
      connectionProviderService.areRegistrationClientCredentialsConfigured,
    ).not.toHaveBeenCalled();
  });

  it('should not be available when the registration declares no Slack OAuth provider', async () => {
    registrationRepository.findOneBy.mockResolvedValue(
      buildRegistration({ connectionProviders: [] }) as never,
    );

    expect(await service.isSlackConnectAvailable()).toBe(false);
  });

  it('should be available when the client credentials are configured', async () => {
    registrationRepository.findOneBy.mockResolvedValue(
      buildRegistration(SLACK_MANIFEST) as never,
    );
    connectionProviderService.areRegistrationClientCredentialsConfigured.mockResolvedValue(
      true,
    );

    expect(await service.isSlackConnectAvailable()).toBe(true);
    expect(
      connectionProviderService.areRegistrationClientCredentialsConfigured,
    ).toHaveBeenCalledWith({
      applicationRegistrationId: 'registration-id',
      clientIdVariable: 'SLACK_CLIENT_ID',
      clientSecretVariable: 'SLACK_CLIENT_SECRET',
    });
  });

  it('should not be available when the client credentials are missing', async () => {
    registrationRepository.findOneBy.mockResolvedValue(
      buildRegistration(SLACK_MANIFEST) as never,
    );
    connectionProviderService.areRegistrationClientCredentialsConfigured.mockResolvedValue(
      false,
    );

    expect(await service.isSlackConnectAvailable()).toBe(false);
  });

  it('should not be available when the lookup throws', async () => {
    registrationRepository.findOneBy.mockRejectedValue(new Error('db is down'));

    expect(await service.isSlackConnectAvailable()).toBe(false);
  });
});
