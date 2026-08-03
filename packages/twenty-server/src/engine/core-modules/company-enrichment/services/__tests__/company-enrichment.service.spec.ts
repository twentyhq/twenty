import { Test, type TestingModule } from '@nestjs/testing';

import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PeopleDataLabsCompanyClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-company-client.service';
import { COMPANY_ENRICHMENT_ATTEMPT_KEY } from 'src/engine/core-modules/company-enrichment/types/company-enrichment-attempt-key-value.type';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

describe('CompanyEnrichmentService', () => {
  let service: CompanyEnrichmentService;
  let userWorkspaceService: { isWorkspaceCreator: jest.Mock };
  let peopleDataLabsCompanyClientService: {
    enrichCompanyByDomain: jest.Mock;
    isEnabled: jest.Mock;
  };
  let throttlerService: { tokenBucketThrottleOrThrow: jest.Mock };
  let keyValuePairService: { set: jest.Mock };
  let twentyConfigService: { get: jest.Mock };

  const workspaceId = 'workspace-id';
  const creatorUserId = 'creator-user-id';

  beforeEach(async () => {
    userWorkspaceService = {
      isWorkspaceCreator: jest
        .fn()
        .mockImplementation(({ userId }) =>
          Promise.resolve(userId === creatorUserId),
        ),
    };
    peopleDataLabsCompanyClientService = {
      enrichCompanyByDomain: jest.fn(),
      isEnabled: jest.fn().mockReturnValue(true),
    };
    throttlerService = { tokenBucketThrottleOrThrow: jest.fn() };
    keyValuePairService = { set: jest.fn() };
    twentyConfigService = {
      get: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyEnrichmentService,
        {
          provide: UserWorkspaceService,
          useValue: userWorkspaceService,
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
          provide: TwentyConfigService,
          useValue: twentyConfigService,
        },
        {
          provide: KeyValuePairService,
          useValue: keyValuePairService,
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

  it('should enrich and return the mapped enrichment on a match', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'matched',
      data: { name: 'Acme Inc', industry: 'computer software' },
    });

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'Foo@ACME.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({
      domain: 'acme.com',
      name: 'Acme Inc',
      industry: 'computer software',
    });
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).toHaveBeenCalledWith('acme.com');
    expect(keyValuePairService.set).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        workspaceId,
        key: COMPANY_ENRICHMENT_ATTEMPT_KEY,
        type: KeyValuePairType.CONFIG_VARIABLE,
        value: expect.objectContaining({
          domain: 'acme.com',
          outcome: 'matched',
        }),
      }),
    );
  });

  it('should pass through a transient error', async () => {
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
  });

  it.each([
    { outcome: 'skipped' },
    { outcome: 'notFound' },
    { outcome: 'permanentError', httpStatus: 401, message: 'unauthorized' },
  ])(
    'should return unavailable on client outcome $outcome',
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
    },
  );

  it('should record the pre-collapse outcome with its HTTP status', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'permanentError',
      httpStatus: 401,
      message: 'unauthorized',
    });

    await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(keyValuePairService.set).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expect.objectContaining({
          domain: 'acme.com',
          outcome: 'permanentError',
          httpStatus: 401,
          message: 'unauthorized',
        }),
      }),
    );
  });

  it('should return unavailable without any lookup when onboarding AI chat is off', async () => {
    twentyConfigService.get.mockReturnValue(false);

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(twentyConfigService.get).toHaveBeenCalledWith(
      'IS_ONBOARDING_AI_CHAT_ENABLED',
    );
    expect(userWorkspaceService.isWorkspaceCreator).not.toHaveBeenCalled();
    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).not.toHaveBeenCalled();
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should not consume throttle tokens when the feature is disabled', async () => {
    peopleDataLabsCompanyClientService.isEnabled.mockReturnValue(false);

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    expect(
      peopleDataLabsCompanyClientService.enrichCompanyByDomain,
    ).not.toHaveBeenCalled();
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should not consume throttle tokens for a non creator', async () => {
    await service.enrichCompanyForWorkspaceCreator({
      userId: 'someone-else',
      email: 'someone@acme.com',
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

  it('should not record an enrichment attempt when the client is never called', async () => {
    await service.enrichCompanyForWorkspaceCreator({
      userId: 'someone-else',
      email: 'someone@acme.com',
      workspaceId,
    });

    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should not record an enrichment attempt when throttled', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should not record an enrichment attempt when the client skips (feature disabled)', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'skipped',
    });

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should still return the enrichment when recording the attempt fails', async () => {
    peopleDataLabsCompanyClientService.enrichCompanyByDomain.mockResolvedValue({
      outcome: 'matched',
      data: { name: 'Acme Inc' },
    });
    keyValuePairService.set.mockRejectedValue(
      new Error('key-value store down'),
    );

    const result = await service.enrichCompanyForWorkspaceCreator({
      userId: creatorUserId,
      email: 'foo@acme.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({
      domain: 'acme.com',
      name: 'Acme Inc',
    });
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
