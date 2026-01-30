import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

import {
  LICENSE_PRICE_PRO_MONTH_ID,
  METER_PRICE_PRO_MONTH_ID,
} from './price.constants';

export const buildSubscription = ({
  planKey = BillingPlanKey.PRO,
  interval = SubscriptionInterval.Month,
  licensedPriceId = LICENSE_PRICE_PRO_MONTH_ID,
  meteredPriceId = METER_PRICE_PRO_MONTH_ID,
  seats = 1,
  workspaceId = 'ws_1',
  stripeSubscriptionId = 'sub_1',
  currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
}: {
  planKey?: BillingPlanKey;
  interval?: SubscriptionInterval;
  licensedPriceId?: string;
  meteredPriceId?: string;
  seats?: number;
  workspaceId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
} = {}): BillingSubscriptionEntity =>
  ({
    id: 'sub_db_1',
    workspaceId,
    stripeSubscriptionId,
    status: SubscriptionStatus.Active,
    interval,
    currentPeriodEnd,
    billingSubscriptionItems: [
      {
        stripeSubscriptionItemId: 'si_licensed',
        stripeProductId: 'prod_base',
        stripePriceId: licensedPriceId,
        quantity: seats,
        billingProduct: {
          metadata: {
            planKey,
            productKey: BillingProductKey.BASE_PRODUCT,
            priceUsageBased: BillingUsageType.LICENSED,
          },
        },
      },
      {
        stripeSubscriptionItemId: 'si_metered',
        stripeProductId: 'prod_metered',
        stripePriceId: meteredPriceId,
        billingProduct: {
          metadata: {
            planKey,
            productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            priceUsageBased: BillingUsageType.METERED,
          },
        },
      },
    ],
  }) as BillingSubscriptionEntity;
