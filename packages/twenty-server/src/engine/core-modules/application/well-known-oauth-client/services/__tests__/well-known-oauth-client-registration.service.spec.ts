import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

const CLAUDE = WELL_KNOWN_OAUTH_CLIENTS.find(
  ({ client }) => client === WellKnownOAuthClient.CLAUDE,
) as (typeof WELL_KNOWN_OAUTH_CLIENTS)[number];

const UP_TO_DATE_CLAUDE_REGISTRATION = {
  id: 'claude-registration-id',
  name: CLAUDE.name,
  description: CLAUDE.description,
  aboutDescription: CLAUDE.aboutDescription,
  author: CLAUDE.author,
  category: CLAUDE.category,
  websiteUrl: CLAUDE.websiteUrl,
  logo: CLAUDE.logo,
  isListed: true,
};

describe('WellKnownOAuthClientRegistrationService', () => {
  let service: WellKnownOAuthClientRegistrationService;
  let update: jest.Mock;
  let findOrCreateOAuthOnlyRegistration: jest.Mock;

  beforeEach(async () => {
    update = jest.fn();
    findOrCreateOAuthOnlyRegistration = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WellKnownOAuthClientRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: { update },
        },
        {
          provide: ApplicationRegistrationSeedingService,
          useValue: { findOrCreateOAuthOnlyRegistration },
        },
      ],
    }).compile();

    service = module.get(WellKnownOAuthClientRegistrationService);
  });

  it('seeds a listed registration with the vendor callbacks', async () => {
    await service.findOrCreateRegistration(CLAUDE);

    expect(findOrCreateOAuthOnlyRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        universalIdentifier: CLAUDE.universalIdentifier,
        name: 'Claude',
        oAuthRedirectUris: ['https://claude.ai/api/mcp/auth_callback'],
        isListed: true,
      }),
    );
  });

  it('brings outdated display content up to date', async () => {
    findOrCreateOAuthOnlyRegistration.mockResolvedValue({
      ...UP_TO_DATE_CLAUDE_REGISTRATION,
      description: 'An older description',
    });

    await expect(service.syncRegistration(CLAUDE)).resolves.toMatchObject({
      hasChanged: true,
    });
    expect(update).toHaveBeenCalledWith(
      'claude-registration-id',
      expect.objectContaining({ description: CLAUDE.description }),
    );
  });

  it('writes nothing when the registration is up to date', async () => {
    findOrCreateOAuthOnlyRegistration.mockResolvedValue(
      UP_TO_DATE_CLAUDE_REGISTRATION,
    );

    await expect(service.syncRegistration(CLAUDE)).resolves.toMatchObject({
      hasChanged: false,
    });
    expect(update).not.toHaveBeenCalled();
  });
});
