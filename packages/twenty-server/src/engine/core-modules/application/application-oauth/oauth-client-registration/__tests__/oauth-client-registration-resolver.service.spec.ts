import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const CLAUDE_CODE_DOCUMENT = {
  clientId: 'https://claude.ai/oauth/claude-code-client-metadata',
  clientName: 'Claude Code',
  logoUri: null,
  redirectUris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
};

describe('OAuthClientRegistrationResolverService', () => {
  let service: OAuthClientRegistrationResolverService;
  let findDocument: jest.Mock;
  let isFetchDue: jest.Mock;
  let tokenBucketThrottleOrThrow: jest.Mock;
  let findOrCreateRegistration: jest.Mock;
  let insertedValues: jest.Mock;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    findDocument = jest.fn();
    isFetchDue = jest.fn();
    tokenBucketThrottleOrThrow = jest.fn();
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
          useValue: { findDocument, isFetchDue },
        },
        {
          provide: WellKnownOAuthClientRegistrationService,
          useValue: { findOrCreateRegistration },
        },
        {
          provide: ThrottlerService,
          useValue: { tokenBucketThrottleOrThrow },
        },
      ],
    }).compile();

    service = module.get(OAuthClientRegistrationResolverService);
  });

  it('looks a registered client id up without fetching anything', async () => {
    const registration = { id: 'registration-id' };

    applicationRegistrationRepository.findOne.mockResolvedValue(registration);

    await expect(
      service.findByClientId('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70'),
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
      service.findByClientId('https://chatgpt.com/oauth/client.json'),
    ).resolves.toBe(seededRegistration);
    expect(findOrCreateRegistration).toHaveBeenCalledWith(
      expect.objectContaining({ client: WellKnownOAuthClient.CHATGPT }),
    );
    expect(insertedValues).not.toHaveBeenCalled();
  });

  it('keeps the document of a well-known client to restrict its callbacks', async () => {
    const seededRegistration = { id: 'seeded-chatgpt' };
    const chatGptDocument = {
      clientId: 'https://chatgpt.com/oauth/client.json',
      clientName: 'ChatGPT',
      logoUri: null,
      redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
    };

    findDocument.mockResolvedValue(chatGptDocument);
    findOrCreateRegistration.mockResolvedValue(seededRegistration);

    await expect(
      service.findOrRegisterByClientId(chatGptDocument.clientId),
    ).resolves.toEqual({
      kind: 'wellKnownClientIdMetadataDocument',
      registration: seededRegistration,
      clientIdMetadataDocument: chatGptDocument,
    });
    expect(insertedValues).not.toHaveBeenCalled();
    expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
  });

  it('only registers a document client once a user authorizes it', async () => {
    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toBeNull();
    await expect(
      service.resolveClient(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toEqual({
      kind: 'clientIdMetadataDocument',
      registration: null,
      clientIdMetadataDocument: CLAUDE_CODE_DOCUMENT,
    });
    expect(insertedValues).not.toHaveBeenCalled();
  });

  it('creates one public registration per document URL for any other client', async () => {
    const createdRegistration = { id: 'claude-code-registration' };

    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);
    applicationRegistrationRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdRegistration);

    await expect(
      service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toEqual({
      kind: 'clientIdMetadataDocument',
      registration: createdRegistration,
      clientIdMetadataDocument: CLAUDE_CODE_DOCUMENT,
    });
    expect(insertedValues).toHaveBeenCalledWith(
      expect.objectContaining({
        universalIdentifier: expect.any(String),
        name: 'Claude Code',
        oAuthClientId: CLAUDE_CODE_DOCUMENT.clientId,
        oAuthClientSecretHash: null,
        oAuthRedirectUris: CLAUDE_CODE_DOCUMENT.redirectUris,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    );
  });

  it('registers a document client again once its registration was soft-deleted', async () => {
    const storedRegistrations: {
      id: string;
      oAuthClientId: string;
      deletedAt: Date | null;
    }[] = [];

    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);
    applicationRegistrationRepository.findOne.mockImplementation(
      async ({ where }: { where: { oAuthClientId: string } }) =>
        storedRegistrations.find(
          (registration) =>
            registration.oAuthClientId === where.oAuthClientId &&
            !isDefined(registration.deletedAt),
        ) ?? null,
    );
    insertedValues.mockImplementation(
      (values: { id?: string; oAuthClientId: string }) => {
        const id = values.id ?? randomUUID();
        const isConflicting = storedRegistrations.some(
          (registration) =>
            registration.id === id ||
            (registration.oAuthClientId === values.oAuthClientId &&
              !isDefined(registration.deletedAt)),
        );

        if (!isConflicting) {
          storedRegistrations.push({ ...values, id, deletedAt: null });
        }
      },
    );

    const firstRegistration = (
      await service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId)
    )?.registration;

    storedRegistrations[0].deletedAt = new Date();

    const secondRegistration = (
      await service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId)
    )?.registration;

    expect(secondRegistration).toMatchObject({
      oAuthClientId: CLAUDE_CODE_DOCUMENT.clientId,
      deletedAt: null,
    });
    expect(secondRegistration?.id).not.toBe(firstRegistration?.id);
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
      service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toMatchObject({
      registration: { name: 'Claude Code (renamed)' },
    });
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

    await service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId);

    expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
  });

  it('resolves nothing when the document cannot be used', async () => {
    findDocument.mockResolvedValue(null);

    await expect(
      service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ).resolves.toBeNull();
  });

  describe('throttleClientIdMetadataDocumentFetchOrThrow', () => {
    const throttle = (clientId: string) =>
      service.throttleClientIdMetadataDocumentFetchOrThrow({
        clientId,
        requestIp: '203.0.113.7',
      });

    it('spends from the IP fetch allowance when the document is due a fetch', async () => {
      isFetchDue.mockResolvedValue(true);

      await throttle(CLAUDE_CODE_DOCUMENT.clientId);

      expect(isFetchDue).toHaveBeenCalledWith(CLAUDE_CODE_DOCUMENT.clientId);
      expect(tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        'oauth-client-metadata-document-fetch:203.0.113.7',
        1,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('leaves the allowance alone while the cached document is fresh', async () => {
      isFetchDue.mockResolvedValue(false);

      await throttle(CLAUDE_CODE_DOCUMENT.clientId);

      expect(tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    });

    it('leaves the allowance alone for a registered client id', async () => {
      await throttle('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70');

      expect(isFetchDue).not.toHaveBeenCalled();
      expect(tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    });
  });
});
