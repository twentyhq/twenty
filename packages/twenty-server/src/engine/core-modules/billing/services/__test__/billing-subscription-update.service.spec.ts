import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';

import {
  arrangeBillingPriceRepositoryFindOneOrFail,
  arrangeBillingProductServiceGetProductPrices,
  arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams,
  arrangeBillingSubscriptionRepositoryFindOneOrFail,
  arrangeStripeSubscriptionScheduleServiceCreateSubscriptionSchedule,
  arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule,
  buildBillingPriceEntity,
  buildDefaultMeteredTiers,
  buildSchedulePhase,
  repoMock,
} from './utils/mock-builders.util';
import {
  LICENSE_PRICE_ENTERPRISE_MONTH_ID,
  LICENSE_PRICE_ENTERPRISE_YEAR_ID,
  LICENSE_PRICE_PRO_MONTH_ID,
  LICENSE_PRICE_PRO_YEAR_ID,
  METER_PRICE_ENTERPRISE_MONTH_ID,
  METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
  METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
  METER_PRICE_ENTERPRISE_YEAR_ID,
  METER_PRICE_PRO_MONTH_ID,
  METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
  METER_PRICE_PRO_MONTH_TIER_LOW_ID,
  METER_PRICE_PRO_YEAR_ID,
} from './utils/price.constants';

describe('BillingSubscriptionUpdateService', () => {
  let module: TestingModule;
  let service: BillingSubscriptionUpdateService;
  let billingSubscriptionRepository: jest.Mocked<
    Repository<BillingSubscriptionEntity>
  >;
  let billingPriceRepository: jest.Mocked<Repository<BillingPriceEntity>>;
  let billingProductService: jest.Mocked<BillingProductService>;
  let billingPriceService: BillingPriceService;
  let stripeSubscriptionScheduleService: jest.Mocked<StripeSubscriptionScheduleService>;
  let stripeSubscriptionService: jest.Mocked<StripeSubscriptionService>;
  let billingSubscriptionPhaseService: jest.Mocked<BillingSubscriptionPhaseService>;
  let billingSubscriptionService: jest.Mocked<BillingSubscriptionService>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionUpdateService,
        {
          provide: BillingSubscriptionService,
          useValue: {
            syncSubscriptionToDatabase: jest
              .fn()
              .mockResolvedValue({} as BillingSubscriptionEntity),
          },
        },
        {
          provide: BillingProductService,
          useValue: {
            getProductPrices: jest.fn(),
          },
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            loadSubscriptionSchedule: jest.fn(),
            createSubscriptionSchedule: jest.fn(),
            updateSchedule: jest.fn().mockResolvedValue({}),
            releaseSubscriptionSchedule: jest.fn(),
            getSubscriptionWithSchedule: jest.fn(),
          },
        },
        {
          provide: StripeSubscriptionService,
          useValue: {
            updateSubscription: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: BillingSubscriptionPhaseService,
          useValue: {
            toPhaseUpdateParams: jest.fn(),
            buildPhaseUpdateParams: jest
              .fn()
              .mockImplementation(
                async ({
                  licensedStripePriceId,
                  seats,
                  meteredStripePriceId,
                  startDate,
                  endDate,
                }) => ({
                  start_date: startDate,
                  ...(endDate ? { end_date: endDate } : {}),
                  proration_behavior: 'none',
                  items: [
                    { price: licensedStripePriceId, quantity: seats },
                    { price: meteredStripePriceId },
                  ],
                  billing_thresholds: {
                    amount_gte: 1000,
                    reset_billing_cycle_anchor: false,
                  },
                }),
              ),
            isSamePhaseSignature: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: repoMock<BillingSubscriptionEntity>(),
        },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: repoMock<BillingPriceEntity>(),
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: repoMock<BillingSubscriptionItemEntity>(),
        },
        {
          provide: StripeBillingAlertService,
          useValue: {
            createUsageThresholdAlertForCustomerMeter: jest.fn(),
          },
        },
        {
          provide: MeteredCreditService,
          useValue: {
            getMeteredPricingInfoFromPriceId: jest
              .fn()
              .mockResolvedValue({ tierCap: 1000, unitPriceCents: 10 }),
            getCreditBalance: jest.fn().mockResolvedValue(0),
          },
        },
        BillingPriceService,
      ],
    }).compile();

    service = module.get(BillingSubscriptionUpdateService);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscriptionEntity),
    );
    billingPriceRepository = module.get(getRepositoryToken(BillingPriceEntity));
    billingProductService = module.get(BillingProductService);
    billingPriceService = module.get(BillingPriceService);
    stripeSubscriptionScheduleService = module.get(
      StripeSubscriptionScheduleService,
    );
    stripeSubscriptionService = module.get(StripeSubscriptionService);
    billingSubscriptionPhaseService = module.get(
      BillingSubscriptionPhaseService,
    );
    billingSubscriptionService = module.get(BillingSubscriptionService);

    jest
      .spyOn(billingPriceService, 'getBillingThresholdsByMeterPriceId')
      .mockResolvedValue({
        amount_gte: 1000,
        reset_billing_cycle_anchor: false,
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSubscription - Plan update', () => {
    it('should update from PRO to ENTERPRISE - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.PLAN,
        newPlan: BillingPlanKey.ENTERPRISE,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          metadata: { plan: BillingPlanKey.ENTERPRISE },
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should update from PRO to ENTERPRISE - with schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
        meteredPriceId: METER_PRICE_PRO_MONTH_ID,
        seats: 1,
      });

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      const refreshedCurrentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
        seats: 1,
      });

      jest
        .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        })
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase: refreshedCurrentPhase,
          nextPhase,
        });

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.PLAN,
        newPlan: BillingPlanKey.ENTERPRISE,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          metadata: { plan: BillingPlanKey.ENTERPRISE },
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          }),
        ],
      });
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should update from ENTERPRISE to PRO - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceCreateSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        currentPhase,
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.PLAN,
        newPlan: BillingPlanKey.PRO,
      });

      expect(
        stripeSubscriptionScheduleService.createSubscriptionSchedule,
      ).toHaveBeenCalled();
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should update from ENTERPRISE to PRO - with schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_ENTERPRISE_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        },
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.PLAN,
        newPlan: BillingPlanKey.PRO,
      });

      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });
  });

  describe('updateSubscription - Metered price update', () => {
    it('should change metered price from low cap to high cap - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_TIER_LOW_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }),
        [METER_PRICE_PRO_MONTH_TIER_HIGH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.METERED_PRICE,
        newMeteredPriceId: METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_PRO_MONTH_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_PRO_MONTH_TIER_HIGH_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change metered price from low cap to high cap - with schedule (ENTERPRISE to PRO downgrade)', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }),
        [METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });

      jest
        .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        })
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase: buildSchedulePhase({
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
            seats: 1,
          }),
          nextPhase,
        });

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.METERED_PRICE,
        newMeteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 1,
            },
            {
              id: 'si_metered',
              price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
            },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_YEAR_ID, quantity: 1 },
              { price: METER_PRICE_PRO_YEAR_ID },
            ],
          }),
        ],
      });
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change metered price from high cap to low cap - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_TIER_HIGH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }),
        [METER_PRICE_PRO_MONTH_TIER_LOW_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
        meteredPriceId: METER_PRICE_PRO_MONTH_TIER_HIGH_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceCreateSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        currentPhase,
      );

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.METERED_PRICE,
        newMeteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
      });

      expect(
        stripeSubscriptionScheduleService.createSubscriptionSchedule,
      ).toHaveBeenCalled();
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_PRO_MONTH_TIER_LOW_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change metered price from high cap to low cap - with schedule (ENTERPRISE to PRO downgrade)', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }),
        [METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(10000),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        },
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(1000),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.METERED_PRICE,
        newMeteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
      });

      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_YEAR_ID, quantity: 1 },
              { price: METER_PRICE_PRO_YEAR_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });
  });

  describe('updateSubscription - Interval update', () => {
    it('should change interval from monthly to yearly - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Year,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_PRO_YEAR_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_PRO_YEAR_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_cycle_anchor: 'now',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change interval from monthly to yearly - with schedule (ENTERPRISE monthly to PRO yearly downgrade)', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });

      jest
        .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        })
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase: buildSchedulePhase({
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            seats: 1,
          }),
          nextPhase,
        });

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Year,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_YEAR_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_cycle_anchor: 'now',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_YEAR_ID, quantity: 1 },
              { price: METER_PRICE_PRO_YEAR_ID },
            ],
          }),
        ],
      });
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change interval from yearly to monthly - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
          meteredPriceId: METER_PRICE_PRO_YEAR_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceCreateSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        currentPhase,
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Month,
      });

      expect(
        stripeSubscriptionScheduleService.createSubscriptionSchedule,
      ).toHaveBeenCalled();
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change interval from yearly to monthly - with schedule (ENTERPRISE yearly to PRO monthly downgrade)', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
        meteredPriceId: METER_PRICE_PRO_MONTH_ID,
        seats: 1,
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        },
      );

      arrangeBillingProductServiceGetProductPrices(billingProductService, [
        buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }) as BillingPriceEntity,
        buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }) as BillingPriceEntity,
      ]);

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Month,
      });

      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 1 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          }),
        ],
      });
      expect(
        stripeSubscriptionService.updateSubscription,
      ).not.toHaveBeenCalled();
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });
  });

  describe('updateSubscription - Seats update', () => {
    it('should change seats from 1 to 2 - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 2,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_PRO_MONTH_ID,
              quantity: 2,
            },
            { id: 'si_metered', price: METER_PRICE_PRO_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change seats from 1 to 2 - with schedule (ENTERPRISE monthly to PRO yearly downgrade)', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          seats: 1,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_ENTERPRISE_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          planKey: BillingPlanKey.ENTERPRISE,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
        meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
        seats: 1,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 1,
      });

      jest
        .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        })
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase: buildSchedulePhase({
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            seats: 2,
          }),
          nextPhase,
        });

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 2,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 2,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_YEAR_ID, quantity: 2 },
              { price: METER_PRICE_PRO_YEAR_ID },
            ],
          }),
        ],
      });
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change seats from 2 to 1 - without schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 2,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule(
        stripeSubscriptionScheduleService,
        {},
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 1,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_PRO_MONTH_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_PRO_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });

    it('should change seats from 2 to 1 - with schedule', async () => {
      arrangeBillingSubscriptionRepositoryFindOneOrFail(
        billingSubscriptionRepository,
        {
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
          meteredPriceId: METER_PRICE_PRO_MONTH_ID,
          seats: 2,
        },
      );

      arrangeBillingPriceRepositoryFindOneOrFail(billingPriceRepository, {
        [LICENSE_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: false,
        }),
        [METER_PRICE_PRO_MONTH_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_MONTH_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Month,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
        [LICENSE_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: LICENSE_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: false,
        }),
        [METER_PRICE_PRO_YEAR_ID]: buildBillingPriceEntity({
          stripePriceId: METER_PRICE_PRO_YEAR_ID,
          planKey: BillingPlanKey.PRO,
          interval: SubscriptionInterval.Year,
          isMetered: true,
          tiers: buildDefaultMeteredTiers(),
        }),
      });

      const currentPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
        meteredPriceId: METER_PRICE_PRO_MONTH_ID,
        seats: 2,
      });
      const nextPhase = buildSchedulePhase({
        licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
        meteredPriceId: METER_PRICE_PRO_YEAR_ID,
        seats: 2,
      });

      jest
        .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase,
          nextPhase,
        })
        .mockResolvedValueOnce({
          schedule: { id: 'schedule_1' } as Stripe.SubscriptionSchedule,
          currentPhase: buildSchedulePhase({
            licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
            meteredPriceId: METER_PRICE_PRO_MONTH_ID,
            seats: 1,
          }),
          nextPhase,
        });

      arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams(
        billingSubscriptionPhaseService,
        {
          items: currentPhase.items,
        } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      );

      await service.updateSubscription('sub_db_1', {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 1,
      });

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_1',
        {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_PRO_MONTH_ID,
              quantity: 1,
            },
            { id: 'si_metered', price: METER_PRICE_PRO_MONTH_ID },
          ],
          proration_behavior: 'create_prorations',
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
        },
      );
      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledWith('schedule_1', {
        phases: [
          expect.objectContaining({ items: currentPhase.items }),
          expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_YEAR_ID, quantity: 1 },
              { price: METER_PRICE_PRO_YEAR_ID },
            ],
          }),
        ],
      });
      expect(
        billingSubscriptionService.syncSubscriptionToDatabase,
      ).toHaveBeenCalled();
    });
  });
});
