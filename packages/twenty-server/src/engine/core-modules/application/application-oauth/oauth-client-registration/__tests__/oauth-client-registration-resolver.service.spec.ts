import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
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
  let executedInsert: jest.Mock;
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
    executedInsert = jest.fn();

    const createInsertQueryBuilder = () => {
      let pendingValues: unknown;
      let ignoresDuplicates = false;

      const insertQueryBuilder = {
        insert: () => insertQueryBuilder,
        into: () => insertQueryBuilder,
        values: (values: unknown) => {
          insertedValues(values);
          pendingValues = values;

          return insertQueryBuilder;
        },
        orIgnore: () => {
          ignoresDuplicates = true;

          return insertQueryBuilder;
        },
        execute: async () => executedInsert(pendingValues, ignoresDuplicates),
      };

      return insertQueryBuilder;
    };

    applicationRegistrationRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(createInsertQueryBuilder),
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

  // Mirrors the unique indexes: a duplicate insert fails unless it was chained with orIgnore
  const storeRegistrationsInMemory = () => {
    const storedRegistrations: {
      id: string;
      oAuthClientId: string;
      deletedAt: Date | null;
    }[] = [];

    applicationRegistrationRepository.findOne.mockImplementation(
      async ({ where }: { where: { oAuthClientId: string } }) =>
        storedRegistrations.find(
          (registration) =>
            registration.oAuthClientId === where.oAuthClientId &&
            !isDefined(registration.deletedAt),
        ) ?? null,
    );
    executedInsert.mockImplementation(
      (
        values: { id?: string; oAuthClientId: string },
        ignoresDuplicates: boolean,
      ) => {
        const id = values.id ?? randomUUID();
        const isConflicting = storedRegistrations.some(
          (registration) =>
            registration.id === id ||
            (registration.oAuthClientId === values.oAuthClientId &&
              !isDefined(registration.deletedAt)),
        );

        if (!isConflicting) {
          storedRegistrations.push({ ...values, id, deletedAt: null });

          return;
        }

        if (!ignoresDuplicates) {
          throw Object.assign(new QueryFailedError('INSERT', [], new Error()), {
            code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
          });
        }
      },
    );

    return storedRegistrations;
  };

  it('looks a registered client id up without fetching anything', async () => {
    const registration = { id: 'registration-id' };

    applicationRegistrationRepository.findOne.mockResolvedValue(registration);

    await expect(
      service.findByClientId('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70'),
    ).resolves.toBe(registration);
    expect(findDocument).not.toHaveBeenCalled();
  });

  it('loads a registration with its client secret hash but without its manifest', async () => {
    await service.findByClientId('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70');

    expect(applicationRegistrationRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['oAuthClientSecretHash']),
      }),
    );
    expect(applicationRegistrationRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.arrayContaining(['manifest']),
      }),
    );
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
    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);

    const storedRegistrations = storeRegistrationsInMemory();

    const firstResolution = await service.findOrRegisterByClientId(
      CLAUDE_CODE_DOCUMENT.clientId,
    );
    const secondResolution = await service.findOrRegisterByClientId(
      CLAUDE_CODE_DOCUMENT.clientId,
    );

    expect(firstResolution).toMatchObject({
      kind: 'clientIdMetadataDocument',
      registration: { oAuthClientId: CLAUDE_CODE_DOCUMENT.clientId },
      clientIdMetadataDocument: CLAUDE_CODE_DOCUMENT,
    });
    expect(secondResolution?.registration).toBe(firstResolution?.registration);
    expect(storedRegistrations).toHaveLength(1);
    expect(insertedValues).toHaveBeenCalledTimes(1);
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

  it('keeps one registration when two authorizations of a new document client race', async () => {
    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);

    const storedRegistrations = storeRegistrationsInMemory();

    const [firstResolution, secondResolution] = await Promise.all([
      service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId),
      service.findOrRegisterByClientId(CLAUDE_CODE_DOCUMENT.clientId),
    ]);

    expect(insertedValues).toHaveBeenCalledTimes(2);
    expect(storedRegistrations).toHaveLength(1);
    expect(firstResolution?.registration).toBe(storedRegistrations[0]);
    expect(secondResolution?.registration).toBe(storedRegistrations[0]);
  });

  it('registers a document client again once its registration was soft-deleted', async () => {
    findDocument.mockResolvedValue(CLAUDE_CODE_DOCUMENT);

    const storedRegistrations = storeRegistrationsInMemory();

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
    const changedDocumentFields = {
      name: 'Claude Code (renamed)',
      logo: 'https://claude.ai/images/claude-code-logo.png',
      oAuthRedirectUris: ['http://localhost/oauth/callback'],
    };

    findDocument.mockResolvedValue({
      ...CLAUDE_CODE_DOCUMENT,
      clientName: changedDocumentFields.name,
      logoUri: changedDocumentFields.logo,
      redirectUris: changedDocumentFields.oAuthRedirectUris,
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
      registration: changedDocumentFields,
    });
    expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
      'claude-code-registration',
      changedDocumentFields,
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
