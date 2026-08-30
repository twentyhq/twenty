/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/custom-ai-provider-access-refresh-interval.constant';
import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('CustomAiProviderAccessService', () => {
  let service: CustomAiProviderAccessService;

  const twentyConfigService = { get: jest.fn() };
  const enterprisePlanService = {
    isValid: jest.fn(),
    getBillableSeatCount: jest.fn(),
  };

  const givenSeatCount = (seatCount: number) =>
    enterprisePlanService.getBillableSeatCount.mockResolvedValue(seatCount);

  // The refresh is deliberately not awaited by its caller, so the assertions
  // that follow one have to let the microtask queue drain first.
  const flushPendingRefresh = () => Promise.resolve();

  beforeEach(async () => {
    jest.clearAllMocks();
    twentyConfigService.get.mockReturnValue(false);
    enterprisePlanService.isValid.mockReturnValue(false);
    givenSeatCount(1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomAiProviderAccessService,
        { provide: TwentyConfigService, useValue: twentyConfigService },
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
      ],
    }).compile();

    service = module.get<CustomAiProviderAccessService>(
      CustomAiProviderAccessService,
    );
  });

  // Several cases move the clock forward; without this the spy would outlive
  // them and leave later cases running at an arbitrary time.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('computeAccess', () => {
    it('reports the threshold alongside the seat count it counted', async () => {
      givenSeatCount(MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1);

      await expect(service.computeAccess()).resolves.toEqual({
        hasAccess: false,
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1,
        seatThreshold: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      });
    });
  });

  describe('getCachedHasAccess', () => {
    it('grants access before any count has come back', () => {
      givenSeatCount(MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1);

      expect(service.getCachedHasAccess()).toBe(true);
    });

    it('serves the verdict of the refresh it triggered to later callers', async () => {
      givenSeatCount(MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1);

      service.getCachedHasAccess();
      await flushPendingRefresh();

      expect(service.getCachedHasAccess()).toBe(false);
    });

    it('counts seats once per refresh interval however often it is read', async () => {
      service.getCachedHasAccess();
      await flushPendingRefresh();
      service.getCachedHasAccess();
      service.getCachedHasAccess();

      expect(enterprisePlanService.getBillableSeatCount).toHaveBeenCalledTimes(
        1,
      );
    });

    it('counts again once the interval has elapsed', async () => {
      service.getCachedHasAccess();
      await flushPendingRefresh();

      jest
        .spyOn(Date, 'now')
        .mockReturnValue(
          Date.now() + CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS,
        );

      service.getCachedHasAccess();
      await flushPendingRefresh();

      expect(enterprisePlanService.getBillableSeatCount).toHaveBeenCalledTimes(
        2,
      );
    });

    it('keeps the previous verdict when the count fails, rather than disabling AI', async () => {
      service.getCachedHasAccess();
      await flushPendingRefresh();

      enterprisePlanService.getBillableSeatCount.mockRejectedValue(
        new Error('connection terminated'),
      );
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(
          Date.now() + CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS,
        );

      service.getCachedHasAccess();
      await flushPendingRefresh();

      expect(service.getCachedHasAccess()).toBe(true);
    });
  });
});
