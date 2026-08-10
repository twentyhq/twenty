import { Test, type TestingModule } from '@nestjs/testing';

import { PeopleDataLabsPersonClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-person-client.service';
import { PersonEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/person-enrichment.service';
import { PERSON_ENRICHMENT_ATTEMPT_KEY } from 'src/engine/core-modules/company-enrichment/types/person-enrichment-attempt-key-value.type';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

describe('PersonEnrichmentService', () => {
  let service: PersonEnrichmentService;
  let userWorkspaceService: { isWorkspaceCreator: jest.Mock };
  let peopleDataLabsPersonClientService: {
    enrichPersonByEmail: jest.Mock;
    isEnabled: jest.Mock;
  };
  let throttlerService: { tokenBucketThrottleOrThrow: jest.Mock };
  let keyValuePairService: { set: jest.Mock };
  let configValues: Record<string, unknown>;

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
    peopleDataLabsPersonClientService = {
      enrichPersonByEmail: jest.fn(),
      isEnabled: jest.fn().mockReturnValue(true),
    };
    throttlerService = { tokenBucketThrottleOrThrow: jest.fn() };
    keyValuePairService = { set: jest.fn() };
    configValues = {
      IS_ONBOARDING_AI_CHAT_ENABLED: true,
      PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonEnrichmentService,
        {
          provide: UserWorkspaceService,
          useValue: userWorkspaceService,
        },
        {
          provide: PeopleDataLabsPersonClientService,
          useValue: peopleDataLabsPersonClientService,
        },
        {
          provide: ThrottlerService,
          useValue: throttlerService,
        },
        {
          provide: TwentyConfigService,
          useValue: { get: (key: string) => configValues[key] },
        },
        {
          provide: KeyValuePairService,
          useValue: keyValuePairService,
        },
      ],
    }).compile();

    service = module.get<PersonEnrichmentService>(PersonEnrichmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return unavailable for a non creator without calling the client', async () => {
    const result = await service.enrichPersonForWorkspaceCreator({
      userId: 'someone-else',
      email: 'someone@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).not.toHaveBeenCalled();
    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('should enrich a free-mail address since person enrichment has no work-domain gate', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'matched',
      data: { full_name: 'Ada Lovelace' },
    });

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@gmail.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).toHaveBeenCalledWith('ada@gmail.com');
  });

  it('should lowercase and trim the email before calling the client', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'notFound',
    });

    await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: '  Ada@ACME.com ',
      workspaceId,
    });

    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).toHaveBeenCalledWith('ada@acme.com');
  });

  it('should enrich and return the mapped enrichment on a match', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'matched',
      data: {
        full_name: 'Ada Lovelace',
        job_title: 'head of sales',
        job_company_name: 'Acme Inc',
      },
    });

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({
      email: 'ada@acme.com',
      fullName: 'Ada Lovelace',
      jobTitle: 'head of sales',
      jobCompanyName: 'Acme Inc',
    });
    expect(keyValuePairService.set).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        workspaceId,
        key: PERSON_ENRICHMENT_ATTEMPT_KEY,
        type: KeyValuePairType.CONFIG_VARIABLE,
        value: expect.objectContaining({
          email: 'ada@acme.com',
          outcome: 'matched',
        }),
      }),
    );
  });

  it('should use its own throttle key', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'notFound',
    });

    await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
      `person-enrichment:throttler:${workspaceId}`,
      1,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('should pass through a transient error', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'transientError',
      httpStatus: 429,
      message: 'rate limited',
    });

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
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
      peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue(
        clientResult,
      );

      const result = await service.enrichPersonForWorkspaceCreator({
        userId: creatorUserId,
        email: 'ada@acme.com',
        workspaceId,
      });

      expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    },
  );

  it('should not consume throttle tokens when the feature is disabled', async () => {
    peopleDataLabsPersonClientService.isEnabled.mockReturnValue(false);

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).not.toHaveBeenCalled();
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should return transientError without calling the client when throttled', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'transientError', enrichment: null });
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).not.toHaveBeenCalled();
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should not record an enrichment attempt when the client skips (feature disabled)', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'skipped',
    });

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(keyValuePairService.set).not.toHaveBeenCalled();
  });

  it('should still return the enrichment when recording the attempt fails', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'matched',
      data: { full_name: 'Ada Lovelace' },
    });
    keyValuePairService.set.mockRejectedValue(
      new Error('key-value store down'),
    );

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({ fullName: 'Ada Lovelace' });
  });

  it('should not call the client when no api key is configured', async () => {
    configValues = { IS_ONBOARDING_AI_CHAT_ENABLED: true };

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).not.toHaveBeenCalled();
  });

  it('should stay unavailable for a book-call-only configuration since the ai chat is its only consumer', async () => {
    configValues = {
      IS_ONBOARDING_AI_CHAT_ENABLED: false,
      CALENDAR_BOOKING_PAGE_ID: 'team/twenty/talk-to-us',
      ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT: 50,
      PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
    };

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).not.toHaveBeenCalled();
  });

  it('should rethrow non throttler errors from the throttler', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new Error('redis down'),
    );

    await expect(
      service.enrichPersonForWorkspaceCreator({
        userId: creatorUserId,
        email: 'ada@acme.com',
        workspaceId,
      }),
    ).rejects.toThrow('redis down');
  });
});
