import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-registration/application-registration-client-id-metadata-document.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const CLIENT_ID = 'https://app.example.com/oauth/client.json';

const VALID_DOCUMENT = {
  client_id: CLIENT_ID,
  client_name: 'Example',
  redirect_uris: ['https://app.example.com/callback'],
};

describe('ApplicationRegistrationClientIdMetadataDocumentService', () => {
  let service: ApplicationRegistrationClientIdMetadataDocumentService;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  let httpGet: jest.Mock;
  let tokenBucketThrottleOrThrow: jest.Mock;

  beforeEach(async () => {
    applicationRegistrationRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (entity) => entity),
      create: jest.fn((entity) => entity),
      update: jest.fn(),
    };
    httpGet = jest.fn().mockResolvedValue({ data: VALID_DOCUMENT });
    tokenBucketThrottleOrThrow = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationClientIdMetadataDocumentService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: SecureHttpClientService,
          useValue: { getHttpClient: () => ({ get: httpGet }) },
        },
        {
          provide: ThrottlerService,
          useValue: { tokenBucketThrottleOrThrow },
        },
      ],
    }).compile();

    service = module.get(
      ApplicationRegistrationClientIdMetadataDocumentService,
    );
  });

  it('should create a public registration keyed by the document URL', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    const registration = await service.findOrRefreshRegistration(CLIENT_ID);

    expect(httpGet).toHaveBeenCalledWith(CLIENT_ID);
    expect(registration).toMatchObject({
      name: 'Example',
      oAuthClientId: CLIENT_ID,
      oAuthClientSecretHash: null,
      oAuthRedirectUris: ['https://app.example.com/callback'],
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    });
  });

  it('should reuse a recently fetched registration without fetching again', async () => {
    const existingRegistration = { id: 'id', updatedAt: new Date() };

    applicationRegistrationRepository.findOne.mockResolvedValue(
      existingRegistration,
    );

    expect(await service.findOrRefreshRegistration(CLIENT_ID)).toBe(
      existingRegistration,
    );
    expect(httpGet).not.toHaveBeenCalled();
  });

  it('should refresh a stale registration in place', async () => {
    const staleRegistration = { id: 'id', updatedAt: new Date(0) };

    applicationRegistrationRepository.findOne.mockResolvedValue(
      staleRegistration,
    );

    await service.findOrRefreshRegistration(CLIENT_ID);

    expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
      { id: 'id' },
      expect.objectContaining({ name: 'Example' }),
    );
    expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
  });

  it('should keep serving a stale registration when the document is unreachable', async () => {
    const staleRegistration = { id: 'id', updatedAt: new Date(0) };

    applicationRegistrationRepository.findOne.mockResolvedValue(
      staleRegistration,
    );
    httpGet.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await service.findOrRefreshRegistration(CLIENT_ID)).toBe(
      staleRegistration,
    );
  });

  it('should reject a document whose client_id does not match its URL', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);
    httpGet.mockResolvedValue({
      data: { ...VALID_DOCUMENT, client_id: 'https://evil.example.com/c.json' },
    });

    expect(await service.findOrRefreshRegistration(CLIENT_ID)).toBeNull();
    expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
  });

  it('should not fetch a document whose URL is rate limited', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);
    tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    expect(await service.findOrRefreshRegistration(CLIENT_ID)).toBeNull();
    expect(httpGet).not.toHaveBeenCalled();
  });
});
