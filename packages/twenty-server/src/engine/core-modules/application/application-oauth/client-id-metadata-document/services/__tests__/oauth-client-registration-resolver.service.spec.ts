import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/oauth-client-registration-resolver.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

const CLAUDE_CODE_DOCUMENT = {
  clientId: 'https://claude.ai/oauth/claude-code-client-metadata',
  clientName: 'Claude Code',
  logoUri: null,
  redirectUris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
};

describe('OAuthClientRegistrationResolverService', () => {
  let service: OAuthClientRegistrationResolverService;
  let findDocument: jest.Mock;
  let findOrCreateRegistration: jest.Mock;
  let insertedValues: jest.Mock;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    findDocument = jest.fn();
    findOrCreateRegistration = jest.fn();
    insertedValues = jest.fn();

    const insertQueryBuilder = {
      insert: () => insertQueryBuilder,
      into: () => insertQueryBuilder,
      values: (values: unknown) => {
        insertedValues(values);

        return insertQueryBuilder;
      },
      orIgnore: () => insertQueryBuilder,
      execute: jest.fn(),
    };

    applicationRegistrationRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => insertQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthClientRegistrationResolverService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: ClientIdMetadataDocumentService,
          useValue: { findDocument },
        },
        {
          provide: WellKnownOAuthClientRegistrationService,
          useValue: { findOrCreateRegistration },
        },
      ],
    }).compile();

    service = module.get(OAuthClientRegistrationResolverService);
  });

  it('looks a registered client id up without fetching anything', async () => {
    const registration = { id: 'registration-id' };

    applicationRegistrationRepository.findOne.mockResolvedValue(registration);

    await expect(
      service.resolveByClientId('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70'),
    ).resolves.toBe(registration);
    expect(findDocument).not.toHaveBeenCalled();
  });

  it('resolves a well-known client document to its seeded registration', async () => {
    const seededRegistration = { id: 'seeded-chatgpt' };

    findDocument.mockResolvedValue({
      clientId: 'https://chatgpt.com/oauth/client.json',
      clientName: 'ChatGPT',
      logoUri: null,
      redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
    });
    findOrCreateRegistration.mockResolvedValue(seededRegistration);

    await expect(
      service.resolveByClientId('https://chatgpt.com/oauth/client.json'),
    ).resolves.toBe(seededRegistration);
    expect(findOrCreateRegistration).toHaveBeenCalledWith(
      expect.objectContaining({ client: WellKnownOAuthClient.CHATGPT }),
    );
    expect(insertedValues).not.toHaveBeenCalled();
  });

  it('creates one public registration per document URL for any other client', async () => {
    const createdRegistration = { id: 'claude-code-registration' };

    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);
    applicationRegistrationRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdRegistration);

    await expect(
      service.resolveByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toBe(createdRegistration);
    expect(insertedValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Claude Code',
        oAuthClientId: CLAUDE_CODE_DOCUMENT.clientId,
        oAuthClientSecretHash: null,
        oAuthRedirectUris: CLAUDE_CODE_DOCUMENT.redirectUris,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    );
  });

  it('follows changes to the document on its existing registration', async () => {
    findDocument.mockResolvedValue({
      ...CLAUDE_CODE_DOCUMENT,
      clientName: 'Claude Code (renamed)',
    });
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: 'claude-code-registration',
      name: 'Claude Code',
      logo: null,
      oAuthRedirectUris: CLAUDE_CODE_DOCUMENT.redirectUris,
    });

    await expect(
      service.resolveByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toMatchObject({ name: 'Claude Code (renamed)' });
    expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
      'claude-code-registration',
      expect.objectContaining({ name: 'Claude Code (renamed)' }),
    );
  });

  it('leaves an unchanged registration alone', async () => {
    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: 'claude-code-registration',
      name: 'Claude Code',
      logo: null,
      oAuthRedirectUris: CLAUDE_CODE_DOCUMENT.redirectUris,
    });

    await service.resolveByClientId(CLAUDE_CODE_DOCUMENT.clientId);

    expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
  });

  it('resolves nothing when the document cannot be used', async () => {
    findDocument.mockResolvedValue(null);

    await expect(
      service.resolveByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toBeNull();
  });
});
