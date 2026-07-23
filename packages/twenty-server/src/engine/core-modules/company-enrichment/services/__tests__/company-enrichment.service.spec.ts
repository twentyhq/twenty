import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { COMPANY_ENRICHMENT_CACHE_TTL_MS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-cache-ttl-ms.constant';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PeopleDataLabsCompanyClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-company-client.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

describe('CompanyEnrichmentService', () => {
  let service: CompanyEnrichmentService;
  let userWorkspaceRepository: { findOne: jest.Mock };
  let peopleDataLabsCompanyClientService: { enrichCompanyByDomain: jest.Mock };
  let throttlerService: { tokenBucketThrottleOrThrow: jest.Mock };
  let cacheStorageService: { get: jest.Mock; set: jest.Mock };

  const workspaceId = 'workspace-id';
  const creatorUserId = 'creator-user-id';

  beforeEach(async () => {
    userWorkspaceRepository = {
      findOne: jest.fn().mockResolvedValue({ userId: creatorUserId }),
    };
    peopleDataLabsCompanyClientService = { enrichCompanyByDomain: jest.fn() };
    throttlerService = { tokenBucketThrottleOrThrow: jest.fn() };
    cacheStorageService = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyEnrichmentService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: PeopleDataLabsCompanyClientService,
          useValue: peopleDataLabsCompanyClientService,
        },
        {
          provide: ThrottlerService,
          useValue: throttlerService,
        },
        {
          provide: CacheStorageNamespace.EngineCompanyEnrichment,
          useValue: cacheStorageService,
        },
      ],
    }).compile();

    service = module.get<CompanyEnrichmentService>(CompanyEnrichmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return unavailable for a non creator without calling the client', async () => {
    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: 'someone-else',
      email: 'someone@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).not.toHaveBeenCalled();
  });

  it.each(['foo@gmail.com', 'foo@GMAIL.com', 'not-an-email'])(
    'should return unavailable for %s without calling the client',
    async (email) => {
      const result = await service.enrichCompanyForWorkspaceCreator({
        userId: creatorUserId,
        email,
        workspaceId,
      });

      expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
      expect(
        peopleDataLabsCompanyClientService.enrichCompanyByDomain,
      ).not.toHaveBeenCalled();
    },
  );

  it('should return the cached enrichment without calling the client', async () => {
    const cachedEnrichment = { domain: 'acme.com', name: 'Acme Inc' };

    cacheStorageService.get.mockResolvedValue(cachedEnrichment);

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'Foo@ACME.com',
      workspaceId,
    });

    expect(result).toEqual({
      outcome: 'matched',
      enrichment: cachedEnrichment,
    });
    expect(cacheStorageService.get).toHaveBeenCalledWith(
      'company-enrichment:domain:acme.com',
    );
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).not.toHaveBeenCalled();
  });

  it('should enrich, cache and return the mapped enrichment on a match', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'matched',
      data: { name: 'Acme Inc', industry: 'computer software' },
    });

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({
      domain: 'acme.com',
      name: 'Acme Inc',
      industry: 'computer software',
    });
    expect(cacheStorageService.set).toHaveBeenCalledWith(
      'company-enrichment:domain:acme.com',
      result.enrichment,
      COMPANY_ENRICHMENT_CACHE_TTL_MS,
    );
  });

  it('should pass through a transient error without caching', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'transientError',
      httpStatus: 429,
      message: 'rate limited',
    });

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'transientError', enrichment: null });
    expect(cacheStorageService.set).not.toHaveBeenCalled();
  });

  it.each([
    { outcome: 'skipped' },
    { outcome: 'notFound' },
    { outcome: 'permanentError', httpStatus: 401, message: 'unauthorized' },
  ])(
    'should return unavailable on client outcome $outcome without caching',
    async (clientResult) => {
      peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue(
        clientResult,
      );

      const result = await service.enrichCompanyForWorkspaceCreator({
        userId: creatorUserId,
        email: 'foo@acme.com',
        workspaceId,
      });

      expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
      expect(cacheStorageService.set).not.toHaveBeenCalled();
    },
  );

  it('should not consume throttle tokens for a non creator', async () => {
    await service.enrichCompanyForWorkspaceCreator({
      userId: 'someone-else',
      email: 'someone@acme.com',
      workspaceId,
    });

    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('should not consume throttle tokens on a cache hit', async () => {
    cacheStorageService.get.mockResolvedValue({ domain: 'acme.com' });

    await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('should return transientError without calling the client when throttled', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'transientError', enrichment: null });
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).not.toHaveBeenCalled();
  });

  it('should rethrow non throttler errors from the throttler', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new Error('redis down'),
    );

    await expect(
      service.enrichCompanyForWorkspaceCreator({
        userId: creatorUserId,
        email: 'foo@acme.com',
        workspaceId,
      }),
    ).rejects.toThrow('redis down');
  });
});
