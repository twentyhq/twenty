import { Test, type TestingModule } from '@nestjs/testing';

import { PEOPLE_DATA_LABS_PERSON_MIN_LIKELIHOOD } from 'src/engine/core-modules/company-enrichment/constants/people-data-labs-person-min-likelihood.constant';
import { PeopleDataLabsPersonClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-person-client.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('PeopleDataLabsPersonClientService', () => {
  let service: PeopleDataLabsPersonClientService;
  let httpClient: { get: jest.Mock };
  let twentyConfigService: { get: jest.Mock };

  const email = 'ada@acme.com';

  beforeEach(async () => {
    httpClient = { get: jest.fn() };
    twentyConfigService = { get: jest.fn().mockReturnValue('pdl-key') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleDataLabsPersonClientService,
        {
          provide: TwentyConfigService,
          useValue: twentyConfigService,
        },
        {
          provide: SecureHttpClientService,
          useValue: { getHttpClient: jest.fn().mockReturnValue(httpClient) },
        },
      ],
    }).compile();

    service = module.get<PeopleDataLabsPersonClientService>(
      PeopleDataLabsPersonClientService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([undefined, '', '   '])(
    'should skip without calling the API when the key is %p',
    async (apiKey) => {
      twentyConfigService.get.mockReturnValue(apiKey);

      const result = await service.enrichPersonByEmail(email);

      expect(result).toEqual({ outcome: 'skipped' });
      expect(httpClient.get).not.toHaveBeenCalled();
    },
  );

  it('should send the email and minimum likelihood as query parameters', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { full_name: 'Ada Lovelace' },
    });

    await service.enrichPersonByEmail(email);

    expect(httpClient.get).toHaveBeenCalledWith('/person/enrich', {
      params: {
        email,
        min_likelihood: PEOPLE_DATA_LABS_PERSON_MIN_LIKELIHOOD,
      },
      headers: { 'X-Api-Key': 'pdl-key' },
    });
  });

  it('should treat a body level 404 under an HTTP 200 as not found', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { status: 404 },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'notFound',
    });
  });

  it('should treat an HTTP 404 as not found', async () => {
    httpClient.get.mockResolvedValue({ status: 404, data: {} });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'notFound',
    });
  });

  it.each([429, 500, 503])(
    'should classify HTTP %i as a transient error',
    async (status) => {
      httpClient.get.mockResolvedValue({ status, data: {} });

      await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
        outcome: 'transientError',
        httpStatus: status,
        message: `PDL request failed (HTTP ${status}).`,
      });
    },
  );

  it('should classify HTTP 401 as a permanent error', async () => {
    httpClient.get.mockResolvedValue({ status: 401, data: {} });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'permanentError',
      httpStatus: 401,
      message: 'PDL request failed (HTTP 401).',
    });
  });

  it('should match on data nested under the data key', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { status: 200, likelihood: 9, data: { full_name: 'Ada Lovelace' } },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'matched',
      data: { full_name: 'Ada Lovelace' },
    });
  });

  it('should match on top level data and strip the envelope fields', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { status: 200, likelihood: 9, full_name: 'Ada Lovelace' },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'matched',
      data: { full_name: 'Ada Lovelace' },
    });
  });

  it('should treat an envelope only body as not found', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { status: 200, likelihood: 2 },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'notFound',
    });
  });

  it('should treat a non object 2xx body as a transient error', async () => {
    httpClient.get.mockResolvedValue({ status: 200, data: '<html></html>' });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'transientError',
      httpStatus: 200,
      message: 'People Data Labs returned a non-JSON response',
    });
  });

  it('should surface the People Data Labs error message when present', async () => {
    httpClient.get.mockResolvedValue({
      status: 402,
      data: { error: { message: 'payment required' } },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'permanentError',
      httpStatus: 402,
      message: 'payment required',
    });
  });

  it('should treat a match below the minimum likelihood as not found', async () => {
    httpClient.get.mockResolvedValue({
      status: 200,
      data: { status: 200, likelihood: 1, data: { full_name: 'Ada Lovelace' } },
    });

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'notFound',
    });
  });

  it('should treat a rejected request as a transient error', async () => {
    httpClient.get.mockRejectedValue(new Error('socket hang up'));

    await expect(service.enrichPersonByEmail(email)).resolves.toEqual({
      outcome: 'transientError',
      httpStatus: 0,
      message: 'socket hang up',
    });
  });
});
