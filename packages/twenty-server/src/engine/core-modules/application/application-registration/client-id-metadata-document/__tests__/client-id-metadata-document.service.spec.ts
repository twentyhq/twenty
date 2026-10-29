import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/client-id-metadata-document.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

const CLIENT_ID = 'https://client.example.com/oauth/client';

const document = {
  client_id: CLIENT_ID,
  client_name: 'Example client',
  redirect_uris: ['https://client.example.com/callback'],
};

describe('ClientIdMetadataDocumentService', () => {
  let service: ClientIdMetadataDocumentService;
  let get: jest.Mock;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  const buildRegistration = (updatedAt: Date) => ({
    id: 'registration-id',
    oAuthClientId: CLIENT_ID,
    name: 'Example client',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    updatedAt,
  });

  beforeEach(async () => {
    get = jest.fn();
    applicationRegistrationRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
      save: jest.fn(async (entity) => entity),
      create: jest.fn((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientIdMetadataDocumentService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: SecureHttpClientService,
          useValue: { getHttpClient: () => ({ get }) },
        },
      ],
    }).compile();

    service = module.get(ClientIdMetadataDocumentService);
  });

  it('creates a public registration keyed by the document URL on first use', async () => {
    get.mockResolvedValue({ data: document });

    const registration = await service.findOrSyncRegistration(CLIENT_ID);

    expect(get).toHaveBeenCalledWith(CLIENT_ID);
    expect(registration).toMatchObject({
      oAuthClientId: CLIENT_ID,
      oAuthClientSecretHash: null,
      name: 'Example client',
      oAuthRedirectUris: ['https://client.example.com/callback'],
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    });
  });

  it('serves a recently synced registration without fetching', async () => {
    const registration = buildRegistration(new Date());

    applicationRegistrationRepository.findOne.mockResolvedValue(registration);

    await expect(service.findOrSyncRegistration(CLIENT_ID)).resolves.toBe(
      registration,
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('keeps the stale registration when the document host is unreachable', async () => {
    const registration = buildRegistration(new Date(0));

    applicationRegistrationRepository.findOne.mockResolvedValue(registration);
    get.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.findOrSyncRegistration(CLIENT_ID)).resolves.toBe(
      registration,
    );
    expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
  });

  it('stops trusting a client whose document became invalid', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildRegistration(new Date(0)),
    );
    get.mockResolvedValue({
      data: { ...document, client_id: 'https://other.example.com/client' },
    });

    await expect(service.findOrSyncRegistration(CLIENT_ID)).resolves.toBeNull();
  });
});
