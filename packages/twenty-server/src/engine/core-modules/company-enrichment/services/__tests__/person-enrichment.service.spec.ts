import { Test, type TestingModule } from '@nestjs/testing';

import { PeopleDataLabsClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-client.service';
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
          provide: PeopleDataLabsClientService,
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

  it('should enrich with the normalized email, use its own throttle key, and record the attempt', async () => {
    peopleDataLabsPersonClientService.enrichPersonByEmail.mockResolvedValue({
      outcome: 'matched',
      data: { full_name: 'Ada Lovelace', job_title: 'head of sales' },
    });

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: '  Ada@ACME.com ',
      workspaceId,
    });

    expect(
      peopleDataLabsPersonClientService.enrichPersonByEmail,
    ).toHaveBeenCalledWith('ada@acme.com');
    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
      `person-enrichment:throttler:${workspaceId}`,
      1,
      expect.any(Number),
      expect.any(Number),
    );
    expect(result.outcome).toBe('matched');
    expect(result.enrichment).toMatchObject({
      email: 'ada@acme.com',
      fullName: 'Ada Lovelace',
      jobTitle: 'head of sales',
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

  it('should return transientError instead of rejecting when a dependency unexpectedly throws', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new Error('redis down'),
    );

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'transientError', enrichment: null });
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
  });

  it('should not consume throttle tokens when the feature is disabled', async () => {
    peopleDataLabsPersonClientService.isEnabled.mockReturnValue(false);

    const result = await service.enrichPersonForWorkspaceCreator({
      userId: creatorUserId,
      email: 'ada@acme.com',
      workspaceId,
    });

    expect(result).toEqual({ outcome: 'unavailable', enrichment: null });
    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
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
});
