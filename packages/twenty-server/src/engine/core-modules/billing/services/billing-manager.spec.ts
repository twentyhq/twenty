/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectLiteral, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';

// Minimal fixtures (duplicate of service spec)
function repoMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

const LICENSE_PRICE_ENTERPRISE_MONTH_ID = 'LICENSE_PRICE_ENTERPRISE_MONTH_ID';
const LICENSE_PRICE_PRO_MONTH_ID = 'LICENCE_PRICE_PRO_MONTH_ID';
const LICENSE_PRICE_ENTERPRISE_YEAR_ID = 'LICENSE_PRICE_ENTERPRISE_YEAR_ID';
const LICENSE_PRICE_PRO_YEAR_ID = 'LICENSE_PRICE_PRO_YEAR_ID';

const METER_PRICE_ENTERPRISE_MONTH_ID = 'METER_PRICE_ENTERPRISE_MONTH_ID';
const METER_PRICE_PRO_MONTH_ID = 'METER_PRICE_PRO_MONTH_ID';
const METER_PRICE_ENTERPRISE_YEAR_ID = 'METER_PRICE_ENTERPRISE_YEAR_ID';
const METER_PRICE_PRO_YEAR_ID = 'METER_PRICE_PRO_YEAR_ID';

describe('BillingManager scenarios (via BillingSubscriptionService)', () => {
  let module: TestingModule;
  let service: BillingSubscriptionService;
  let billingEntitlementRepository: Repository<BillingEntitlement>;
  let billingSubscriptionRepository: Repository<BillingSubscription>;
  let billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>;
  let billingCustomerRepository: Repository<BillingCustomer>;
  let billingPriceRepository: Repository<BillingPrice>;
  let billingPlanService: BillingPlanService;
  let billingProductService: BillingProductService;
  let stripeCustomerService: StripeCustomerService;
  let stripeSubscriptionItemService: StripeSubscriptionItemService;
  let stripeSubscriptionScheduleService: StripeSubscriptionScheduleService;
  let stripeSubscriptionService: StripeSubscriptionService;
  let billingSubscriptionPhaseService: BillingSubscriptionPhaseService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        {
          provide: BillingPlanService,
          useValue: {
            getPlanBaseProduct: jest.fn(),
            listPlans: jest.fn(),
            getPlanByPriceId: jest.fn(),
            getPricesPerPlanByInterval: jest.fn(),
          },
        },
        {
          provide: BillingProductService,
          useValue: {
            getProductPrices: jest.fn(),
          },
        },
        {
          provide: StripeCustomerService,
          useValue: {
            hasPaymentMethod: jest.fn(),
          },
        },
        { provide: StripeSubscriptionItemService, useValue: {} },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn(),
            findOrCreateSubscriptionSchedule: jest.fn(),
            getEditablePhases: jest.fn(),
            replaceEditablePhases: jest.fn(),
          },
        },
        {
          provide: StripeSubscriptionService,
          useValue: {
            updateSubscription: jest.fn(),
            cancelSubscription: jest.fn(),
            collectLastInvoice: jest.fn(),
            getBillingThresholdsByInterval: jest.fn().mockResolvedValue({
              amount_gte: 1000,
              reset_billing_cycle_anchor: false,
            }),
          },
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn(),
            findOrCreateSubscriptionSchedule: jest.fn(),
            getEditablePhases: jest.fn(),
            replaceEditablePhases: jest.fn(),
          },
        },
        {
          provide: BillingSubscriptionPhaseService,
          useValue: {
            getDetailsFromPhase: jest.fn(),
            toSnapshot: jest.fn(),
            buildSnapshot: jest.fn(),
            getLicensedPriceIdFromSnapshot: jest.fn(),
            isSamePhaseSignature: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(0),
          },
        },
        {
          provide: getRepositoryToken(BillingEntitlement),
          useValue: repoMock<BillingEntitlement>(),
        },
        {
          provide: getRepositoryToken(BillingSubscription),
          useValue: repoMock<BillingSubscription>(),
        },
        {
          provide: getRepositoryToken(BillingPrice),
          useValue: repoMock<BillingPrice>(),
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItem),
          useValue: repoMock<BillingSubscriptionItem>(),
        },
        {
          provide: getRepositoryToken(BillingCustomer),
          useValue: repoMock<BillingCustomer>(),
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionService);
    billingCustomerRepository = module.get<Repository<BillingCustomer>>(
      getRepositoryToken(BillingCustomer),
    );
    billingEntitlementRepository = module.get<Repository<BillingEntitlement>>(
      getRepositoryToken(BillingEntitlement),
    );
    billingSubscriptionRepository = module.get<Repository<BillingSubscription>>(
      getRepositoryToken(BillingSubscription),
    );
    billingCustomerRepository = module.get<Repository<BillingCustomer>>(
      getRepositoryToken(BillingCustomer),
    );
    billingSubscriptionItemRepository = module.get<
      Repository<BillingSubscriptionItem>
    >(getRepositoryToken(BillingSubscriptionItem));
    billingPriceRepository = module.get<Repository<BillingPrice>>(
      getRepositoryToken(BillingPrice),
    );
    billingPlanService = module.get<BillingPlanService>(BillingPlanService);
    billingProductService = module.get<BillingProductService>(
      BillingProductService,
    );
    stripeCustomerService = module.get<StripeCustomerService>(
      StripeCustomerService,
    );
    stripeSubscriptionItemService = module.get<StripeSubscriptionItemService>(
      StripeSubscriptionItemService,
    );
    stripeSubscriptionScheduleService =
      module.get<StripeSubscriptionScheduleService>(
        StripeSubscriptionScheduleService,
      );
    stripeSubscriptionService = module.get<StripeSubscriptionService>(
      StripeSubscriptionService,
    );
    stripeSubscriptionScheduleService =
      module.get<StripeSubscriptionScheduleService>(
        StripeSubscriptionScheduleService,
      );
    billingSubscriptionPhaseService =
      module.get<BillingSubscriptionPhaseService>(
        BillingSubscriptionPhaseService,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePlan', () => {
    describe('Without phase', () => {
      it('upgrade PRO -> ENTERPRISE updates immediately (0/1 phase)', async () => {
        const currentSubscription = {
          id: 'sub_db_1',
          workspaceId: 'ws_1',
          stripeSubscriptionId: 'sub_1',
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Month,
          billingSubscriptionItems: [
            {
              stripeSubscriptionItemId: 'si_licensed',
              stripeProductId: 'prod_base',
              stripePriceId: 'price_licensed_m',
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripeSubscriptionItemId: 'si_metered',
              stripeProductId: 'prod_metered',
              stripePriceId: 'price_metered_m_1000',
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ],
        } as BillingSubscription;

        jest
          .spyOn(billingSubscriptionRepository, 'find')
          .mockResolvedValueOnce([currentSubscription]);

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'findOrCreateSubscriptionSchedule',
          )
          .mockResolvedValue({
            phases: [],
          } as unknown as Stripe.SubscriptionSchedule);

        jest
          .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
          .mockResolvedValueOnce({
            licensedPrice: {
              stripePriceId: 'price_licensed_m',
              quantity: 7,
            } as unknown as BillingPrice,
            meteredPrice: {
              stripePriceId: 'price_metered_m_1000',
            } as unknown as BillingPrice,
            plan: {
              planKey: BillingPlanKey.PRO,
              licensedProducts: [],
              meteredProducts: [],
            } as BillingGetPlanResult,
            quantity: 7,
            interval: SubscriptionInterval.Month,
          });

        jest
          .spyOn(stripeSubscriptionScheduleService, 'getEditablePhases')
          .mockReturnValueOnce({
            currentEditable: {
              items: [
                {
                  price: 'price_licensed_m',
                  quantity: 7,
                },
                {
                  price: 'price_metered_m_1000',
                },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
            nextEditable: undefined,
          });

        jest
          .spyOn(billingProductService, 'getProductPrices')
          .mockResolvedValueOnce([
            {
              stripePriceId: 'price_licensed_m',
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: 'price_metered_m_1000',
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>);

        jest
          .spyOn(billingPriceRepository, 'findOneOrFail')
          .mockResolvedValueOnce({
            stripePriceId: 'price_metered_m_1000',
            interval: SubscriptionInterval.Month,
            tiers: [
              {
                up_to: 1000,
                flat_amount: 1000,
                unit_amount: null,
                flat_amount_decimal: 100000,
                unit_amount_decimal: null,
              },
              {
                up_to: null,
                flat_amount: null,
                unit_amount: null,
                flat_amount_decimal: null,
                unit_amount_decimal: 100,
              },
            ],
            billingProduct: {
              metadata: {
                planKey: BillingPlanKey.ENTERPRISE,
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                priceUsageBased: BillingUsageType.METERED,
              },
            },
          } as unknown as BillingPrice);

        jest
          .spyOn(billingSubscriptionRepository, 'findOneOrFail')
          .mockResolvedValueOnce(currentSubscription);

        jest
          .spyOn(stripeSubscriptionService, 'updateSubscription')
          .mockResolvedValueOnce({} as Stripe.Subscription);

        jest
          .spyOn(service, 'syncSubscriptionToDatabase')
          .mockResolvedValueOnce({} as BillingSubscription);

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(currentSubscription.stripeSubscriptionId, {
          items: [
            {
              id: 'si_licensed',
              price: 'price_licensed_m',
              quantity: 7,
            },
            {
              id: 'si_metered',
              price: 'price_metered_m_1000',
            },
          ],
          metadata: {
            plan: 'ENTERPRISE',
          },
          proration_behavior: 'create_prorations',
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();
      });
      it('downgrade ENTERPRISE -> PRO schedules change on next phase', async () => {
        const currentSubscription = {
          id: 'sub_db_1',
          workspaceId: 'ws_1',
          stripeSubscriptionId: 'sub_1',
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Month,
          billingSubscriptionItems: [
            {
              stripeSubscriptionItemId: 'si_licensed',
              stripeProductId: 'prod_base',
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripeSubscriptionItemId: 'si_metered',
              stripeProductId: 'prod_metered',
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ],
        } as BillingSubscription;

        jest
          .spyOn(billingSubscriptionRepository, 'find')
          .mockResolvedValueOnce([currentSubscription]);

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'findOrCreateSubscriptionSchedule',
          )
          .mockResolvedValue({
            id: 'scheduleId',
            phases: [],
          } as unknown as Stripe.SubscriptionSchedule);

        jest
          .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
          .mockResolvedValueOnce({
            licensedPrice: {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 7,
            } as unknown as BillingPrice,
            meteredPrice: {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            } as unknown as BillingPrice,
            plan: {
              planKey: BillingPlanKey.ENTERPRISE,
              licensedProducts: [],
              meteredProducts: [],
            } as BillingGetPlanResult,
            quantity: 7,
            interval: SubscriptionInterval.Month,
          });

        jest
          .spyOn(stripeSubscriptionScheduleService, 'getEditablePhases')
          .mockReturnValue({
            currentEditable: {
              items: [
                {
                  price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                  quantity: 7,
                },
                {
                  price: METER_PRICE_ENTERPRISE_MONTH_ID,
                },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
            nextEditable: undefined,
          });

        jest.spyOn(billingPriceRepository, 'findOneOrFail').mockResolvedValue({
          stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          interval: SubscriptionInterval.Month,
          tiers: [
            {
              up_to: 1000,
              flat_amount: 1000,
              unit_amount: null,
              flat_amount_decimal: 100000,
              unit_amount_decimal: null,
            },
            {
              up_to: null,
              flat_amount: null,
              unit_amount: null,
              flat_amount_decimal: null,
              unit_amount_decimal: 100,
            },
          ],
          billingProduct: {
            metadata: {
              planKey: BillingPlanKey.ENTERPRISE,
              productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
              priceUsageBased: BillingUsageType.METERED,
            },
          },
        } as unknown as BillingPrice);

        jest
          .spyOn(billingProductService, 'getProductPrices')
          .mockResolvedValueOnce([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>)
          .mockResolvedValueOnce([
            {
              stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: METER_PRICE_PRO_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>);

        jest
          .spyOn(billingSubscriptionPhaseService, 'toSnapshot')
          .mockReturnValueOnce({
            end_date: new Date().getTime() + 1000,
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(billingSubscriptionPhaseService, 'buildSnapshot')
          .mockReturnValueOnce({
            start_date: new Date().getTime() + 1000,
            end_date: new Date().getTime() + 2000,
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(billingPriceRepository, 'findOneByOrFail')
          .mockResolvedValueOnce({
            stripePriceId: 'price_metered_m_1000',
          } as unknown as BillingPrice);

        jest
          .spyOn(stripeSubscriptionService, 'getBillingThresholdsByInterval')
          .mockReturnValueOnce({
            amount_gte: 10000,
            reset_billing_cycle_anchor: false,
          });

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'getSubscriptionWithSchedule',
          )
          .mockResolvedValue({
            id: 'sub_id',
          } as SubscriptionWithSchedule);

        jest
          .spyOn(billingSubscriptionRepository, 'findOneByOrFail')
          .mockResolvedValue({
            workspaceId: 'workspaceId',
          } as BillingSubscription);

        jest
          .spyOn(service, 'syncSubscriptionToDatabase')
          .mockResolvedValueOnce({} as BillingSubscription);
        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith('scheduleId', {
          currentSnapshot: {
            end_date: expect.any(Number),
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          },
          nextPhase: {
            end_date: expect.any(Number),
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
            start_date: expect.any(Number),
          },
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();
      });
    });
    describe('With phase', () => {
      it('upgrade PRO -> ENTERPRISE. Updates immediately + update next phase', async () => {
        const currentSubscription = {
          id: 'sub_db_1',
          workspaceId: 'ws_1',
          stripeSubscriptionId: 'sub_1',
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Month,
          billingSubscriptionItems: [
            {
              stripeSubscriptionItemId: 'si_licensed',
              stripeProductId: 'prod_base',
              stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripeSubscriptionItemId: 'si_metered',
              stripeProductId: 'prod_metered',
              stripePriceId: METER_PRICE_PRO_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ],
        } as BillingSubscription;

        jest
          .spyOn(billingSubscriptionRepository, 'find')
          .mockResolvedValueOnce([currentSubscription]);

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'findOrCreateSubscriptionSchedule',
          )
          .mockResolvedValue({
            id: 'scheduleId',
            phases: [{ id: 'phase_current' }, { id: 'phase_next' }],
          } as unknown as Stripe.SubscriptionSchedule);

        // Current phase is PRO Month with 7 seats
        jest
          .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
          .mockResolvedValueOnce({
            licensedPrice: {
              stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
              quantity: 7,
            } as unknown as BillingPrice,
            meteredPrice: {
              stripePriceId: METER_PRICE_PRO_MONTH_ID,
            } as unknown as BillingPrice,
            plan: {
              planKey: BillingPlanKey.PRO,
              licensedProducts: [],
              meteredProducts: [],
            } as BillingGetPlanResult,
            quantity: 7,
            interval: SubscriptionInterval.Month,
          });

        // Editable phases include both
        jest
          .spyOn(stripeSubscriptionScheduleService, 'getEditablePhases')
          .mockReturnValue({
            currentEditable: {
              start_date: new Date().getTime() - 1000,
              end_date: new Date().getTime() + 1000,
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_ID },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
            nextEditable: {
              start_date: new Date().getTime() + 1000,
              end_date: new Date().getTime() + 2000,
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_ID },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
          });

        // Enterprise product prices (target)
        jest
          .spyOn(billingProductService, 'getProductPrices')
          .mockResolvedValueOnce([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>);

        // For thresholds and price lookup
        jest
          .spyOn(billingPriceRepository, 'findOneOrFail')
          .mockResolvedValueOnce({
            stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            interval: SubscriptionInterval.Month,
            tiers: [
              {
                up_to: 1000,
                flat_amount: 1000,
                unit_amount: null,
                flat_amount_decimal: 100000,
                unit_amount_decimal: null,
              },
              {
                up_to: null,
                flat_amount: null,
                unit_amount: null,
                flat_amount_decimal: null,
                unit_amount_decimal: 100,
              },
            ],
            billingProduct: {
              metadata: {
                planKey: BillingPlanKey.ENTERPRISE,
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                priceUsageBased: BillingUsageType.METERED,
              },
            },
          } as unknown as BillingPrice);

        jest
          .spyOn(billingSubscriptionRepository, 'findOneOrFail')
          .mockResolvedValueOnce(currentSubscription);

        jest
          .spyOn(stripeSubscriptionService, 'updateSubscription')
          .mockResolvedValueOnce({} as Stripe.Subscription);

        jest
          .spyOn(service, 'syncSubscriptionToDatabase')
          .mockResolvedValueOnce({} as BillingSubscription);

        // Snapshots helpers for phases
        jest
          .spyOn(billingSubscriptionPhaseService, 'toSnapshot')
          .mockReturnValueOnce({
            end_date: expect.any(Number) as unknown as number,
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(billingSubscriptionPhaseService, 'buildSnapshot')
          .mockReturnValueOnce({
            start_date: expect.any(Number) as unknown as number,
            end_date: expect.any(Number) as unknown as number,
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(stripeSubscriptionService, 'getBillingThresholdsByInterval')
          .mockReturnValueOnce({
            amount_gte: 10000,
            reset_billing_cycle_anchor: false,
          });

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'getSubscriptionWithSchedule',
          )
          .mockResolvedValue({ id: 'sub_id' } as SubscriptionWithSchedule);

        jest
          .spyOn(billingSubscriptionRepository, 'findOneByOrFail')
          .mockResolvedValue({
            workspaceId: 'workspaceId',
          } as BillingSubscription);

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(currentSubscription.stripeSubscriptionId, {
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 7,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_MONTH_ID },
          ],
          metadata: { plan: 'ENTERPRISE' },
          proration_behavior: 'create_prorations',
        });

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).not.toHaveBeenCalled();
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();
      });
      it('downgrade ENTERPRISE -> PRO. Schedules update on next phase exclusively', async () => {
        const currentSubscription = {
          id: 'sub_db_1',
          workspaceId: 'ws_1',
          stripeSubscriptionId: 'sub_1',
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Month,
          billingSubscriptionItems: [
            {
              stripeSubscriptionItemId: 'si_licensed',
              stripeProductId: 'prod_base',
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripeSubscriptionItemId: 'si_metered',
              stripeProductId: 'prod_metered',
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ],
        } as BillingSubscription;

        jest
          .spyOn(billingSubscriptionRepository, 'find')
          .mockResolvedValueOnce([currentSubscription]);

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'findOrCreateSubscriptionSchedule',
          )
          .mockResolvedValue({
            id: 'scheduleId',
            phases: [{ id: 'phase_current' }, { id: 'phase_next' }],
          } as unknown as Stripe.SubscriptionSchedule);

        // Current phase is ENTERPRISE Month with 7 seats
        jest
          .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
          .mockResolvedValueOnce({
            licensedPrice: {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 7,
            } as unknown as BillingPrice,
            meteredPrice: {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            } as unknown as BillingPrice,
            plan: {
              planKey: BillingPlanKey.ENTERPRISE,
              licensedProducts: [],
              meteredProducts: [],
            } as BillingGetPlanResult,
            quantity: 7,
            interval: SubscriptionInterval.Month,
          });

        // Editable phases include both current and next
        jest
          .spyOn(stripeSubscriptionScheduleService, 'getEditablePhases')
          .mockReturnValue({
            currentEditable: {
              start_date: new Date().getTime() - 1000,
              end_date: new Date().getTime() + 1000,
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
            nextEditable: {
              start_date: new Date().getTime() + 1000,
              end_date: new Date().getTime() + 2000,
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            } as Stripe.SubscriptionSchedule.Phase,
          });

        // Prices for current ENTERPRISE and target PRO
        jest
          .spyOn(billingProductService, 'getProductPrices')
          .mockResolvedValueOnce([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>)
          .mockResolvedValueOnce([
            {
              stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            },
            {
              stripePriceId: METER_PRICE_PRO_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: 100000,
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: 100,
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.PRO,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            },
          ] as unknown as Array<BillingPrice>);

        jest
          .spyOn(billingSubscriptionPhaseService, 'toSnapshot')
          .mockReturnValueOnce({
            end_date: expect.any(Number) as unknown as number,
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(billingSubscriptionPhaseService, 'buildSnapshot')
          .mockReturnValueOnce({
            start_date: expect.any(Number) as unknown as number,
            end_date: expect.any(Number) as unknown as number,
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          } as Stripe.SubscriptionScheduleUpdateParams.Phase);

        jest
          .spyOn(billingPriceRepository, 'findOneByOrFail')
          .mockResolvedValueOnce({
            stripePriceId: METER_PRICE_PRO_MONTH_ID,
          } as unknown as BillingPrice);

        // findOneOrFail for ENTERPRISE then PRO metered price lookup during resolvePrices
        jest
          .spyOn(billingPriceRepository, 'findOneOrFail')
          .mockResolvedValueOnce({
            stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            interval: SubscriptionInterval.Month,
            tiers: [
              {
                up_to: 1000,
                flat_amount: 1000,
                unit_amount: null,
                flat_amount_decimal: 100000,
                unit_amount_decimal: null,
              },
              {
                up_to: null,
                flat_amount: null,
                unit_amount: null,
                flat_amount_decimal: null,
                unit_amount_decimal: 100,
              },
            ],
            billingProduct: {
              metadata: {
                planKey: BillingPlanKey.ENTERPRISE,
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                priceUsageBased: BillingUsageType.METERED,
              },
            },
          } as unknown as BillingPrice)
          .mockResolvedValueOnce({
            stripePriceId: METER_PRICE_PRO_MONTH_ID,
            interval: SubscriptionInterval.Month,
            tiers: [
              {
                up_to: 1000,
                flat_amount: 1000,
                unit_amount: null,
                flat_amount_decimal: 100000,
                unit_amount_decimal: null,
              },
              {
                up_to: null,
                flat_amount: null,
                unit_amount: null,
                flat_amount_decimal: null,
                unit_amount_decimal: 100,
              },
            ],
            billingProduct: {
              metadata: {
                planKey: BillingPlanKey.PRO,
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                priceUsageBased: BillingUsageType.METERED,
              },
            },
          } as unknown as BillingPrice);

        jest
          .spyOn(stripeSubscriptionService, 'getBillingThresholdsByInterval')
          .mockReturnValueOnce({
            amount_gte: 10000,
            reset_billing_cycle_anchor: false,
          });

        jest
          .spyOn(
            stripeSubscriptionScheduleService,
            'getSubscriptionWithSchedule',
          )
          .mockResolvedValue({ id: 'sub_id' } as SubscriptionWithSchedule);

        jest
          .spyOn(billingSubscriptionRepository, 'findOneByOrFail')
          .mockResolvedValue({
            workspaceId: 'workspaceId',
          } as BillingSubscription);

        jest
          .spyOn(service, 'syncSubscriptionToDatabase')
          .mockResolvedValueOnce({} as BillingSubscription);

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).not.toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith('scheduleId', {
          currentSnapshot: expect.any(Object),
          nextPhase: expect.any(Object),
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();
      });
    });
  });

  // describe('changeInterval', () => {
  //   it('upgrade Month -> Year updates immediately (0/1 phase)', async () => {
  //     arrangeGetCurrentSubEntity();
  //     arrangeScheduleWithCurrentAndNext();
  //     arrangePlanMapping();
  //
  //     await service.changeInterval(makeWorkspace());
  //
  //     expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalled();
  //   });
  //
  //   it('downgrade Year -> Month schedules change (create or update phase 2)', async () => {
  //     arrangeGetCurrentSubEntity();
  //     arrangeScheduleWithCurrentAndNext();
  //     arrangePlanMapping();
  //
  //     // Pretend current interval is Year to trigger downgrade path
  //     jest
  //       .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
  //       .mockReturnValue({
  //         licensed: { stripePriceId: 'price_licensed_y', quantity: 7 },
  //         metered: { stripePriceId: 'price_metered_y_12000' },
  //         planKey: BillingPlanKey.PRO,
  //         interval: SubscriptionInterval.Year,
  //       } as any);
  //
  //     await service.changeInterval(makeWorkspace());
  //
  //     expect(
  //       stripeSubscriptionScheduleService.replaceEditablePhases,
  //     ).toHaveBeenCalled();
  //   });
  // });

  // describe('changeMeteredPrice', () => {
  //   it('changing metered price triggers immediate update when upgrading', async () => {
  //     arrangeGetCurrentSubEntity();
  //     arrangeScheduleWithCurrentAndNext();
  //     arrangePlanMapping();
  //
  //     await service.changeMeteredPrice(
  //       makeWorkspace(),
  //       'price_metered_m_ent_1000',
  //     );
  //
  //     expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalled();
  //   });
  //
  //   it('changing metered price schedules when considered downgrade', async () => {
  //     arrangeGetCurrentSubEntity();
  //     arrangeScheduleWithCurrentAndNext();
  //     arrangePlanMapping();
  //
  //     // From enterprise metered to pro metered -> downgrade
  //     jest
  //       .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
  //       .mockReturnValue({
  //         licensed: { stripePriceId: 'price_licensed_m_ent', quantity: 7 },
  //         metered: { stripePriceId: 'price_metered_m_ent_1000' },
  //         planKey: BillingPlanKey.ENTERPRISE,
  //         interval: SubscriptionInterval.Month,
  //       } as any);
  //
  //     await service.changeMeteredPrice(makeWorkspace(), 'price_metered_m_1000');
  //
  //     expect(
  //       stripeSubscriptionScheduleService.replaceEditablePhases,
  //     ).toHaveBeenCalled();
  //   });
  // });
});
