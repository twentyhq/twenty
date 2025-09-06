import {
  type SubscriptionInterval,
  useListPlansQuery,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { findOrThrow } from '~/utils/array/findOrThrow';
import {
  type BillingPlanKey,
  type BillingPriceLicensedDto,
  type BillingPriceMeteredDto,
  BillingProductKey,
  BillingUsageType,
} from '~/generated/graphql';
import { type MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilValue } from 'recoil';

export const useBillingPlan = () => {
  const { data: plans } = useListPlansQuery();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const getCurrentWorkspace = () => {
    if (!isDefined(currentWorkspace)) {
      throw new Error('currentWorkspace is undefined');
    }

    return currentWorkspace;
  };

  const listPlans = () => {
    if (!plans) {
      throw new Error('plans is undefined');
    }
    return plans.listPlans;
  };

  const listProdcuts = () => {
    return listPlans().flatMap((plan) => [
      ...plan.licensedProducts,
      ...plan.meteredProducts,
    ]);
  };

  const getPlanByPlanKey = (planKey: BillingPlanKey) => {
    if (!plans) {
      throw new Error('plans is undefined');
    }
    return findOrThrow(listPlans(), (plan) => plan.planKey === planKey);
  };

  const getBaseProductByPlanKey = (planKey: BillingPlanKey) => {
    return findOrThrow(
      getPlanByPlanKey(planKey).licensedProducts,
      (product) =>
        product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
    );
  };

  const getBaseLicensedPriceByPlanKeyAndInterval = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
  ) => {
    const baseProduct = getBaseProductByPlanKey(planKey);

    if (!baseProduct.prices) {
      throw new Error('Product prices is undefined.');
    }

    return findOrThrow(
      baseProduct.prices,
      (price) => price.recurringInterval === interval,
    );
  };

  const listLicensedPrices = (): Array<BillingPriceLicensedDto> => {
    const prices = plans?.listPlans
      .flatMap((plan) => plan.licensedProducts)
      .flatMap(({ prices }) => prices ?? []);

    if (!isDefined(prices)) {
      throw new Error('No prices found');
    }

    return prices;
  };

  const listMeteredPrices = (): Array<BillingPriceMeteredDto> => {
    const prices = plans?.listPlans
      .flatMap((plan) => plan.meteredProducts)
      .flatMap(({ prices }) => prices ?? []);

    if (!isDefined(prices)) {
      throw new Error('No prices found');
    }

    return prices;
  };

  const getPriceAndBillingUsageByPriceId = (
    priceId: string,
  ):
    | {
        price: BillingPriceLicensedDto;
        billingUsage: BillingUsageType.LICENSED;
      }
    | {
        price: BillingPriceMeteredDto;
        billingUsage: BillingUsageType.METERED;
      } => {
    const licensedPrice = listLicensedPrices().find(
      (price) => price.stripePriceId === priceId,
    );

    if (isDefined(licensedPrice)) {
      return {
        price: licensedPrice,
        billingUsage: BillingUsageType.LICENSED,
      };
    }

    const meteredPrice = listMeteredPrices().find(
      (price) => price.stripePriceId === priceId,
    );
    if (isDefined(meteredPrice)) {
      return {
        price: meteredPrice,
        billingUsage: BillingUsageType.METERED,
      };
    }

    throw new Error('Price not found');
  };

  const getCurrentPlan = () => {
    if (!plans) {
      throw new Error('plans is undefined');
    }

    return findOrThrow(
      listPlans(),
      (plan) =>
        plan.planKey ===
        getCurrentWorkspace().currentBillingSubscription?.metadata?.['plan'],
    );
  };

  const getCurrentMeteredBillingSubscriptionItem = () => {
    const billingSubscriptionItems =
      getCurrentWorkspace().currentBillingSubscription
        ?.billingSubscriptionItems;

    if (!billingSubscriptionItems) {
      throw new Error('billingSubscriptionItems is undefined');
    }

    return findOrThrow(
      billingSubscriptionItems,
      (billingSubscriptionItem) =>
        billingSubscriptionItem.billingProduct.metadata?.['productKey'] ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );
  };

  const getCurrentMeteredBillingPrice = () => {
    const currentMeteredBillingSubscriptionItem =
      getCurrentMeteredBillingSubscriptionItem();

    const meteredPrices = getCurrentMeteredPricesByInterval();

    return findOrThrow(
      meteredPrices,
      (price) =>
        price.stripePriceId ===
        currentMeteredBillingSubscriptionItem.stripePriceId,
    ) as MeteredBillingPrice;
  };

  const getCurrentMeteredPricesByInterval = (
    interval?: SubscriptionInterval | undefined | null,
  ): Array<MeteredBillingPrice> => {
    const meteredPrices = getCurrentPlan()
      .meteredProducts.map(({ prices }) => prices)
      .flat() as Array<MeteredBillingPrice>;

    return interval
      ? meteredPrices.filter((price) => price.recurringInterval === interval)
      : meteredPrices;
  };

  const getCurrentLicensedPricesByInterval = (
    interval?: SubscriptionInterval | undefined | null,
  ) => {
    const { licensedProducts } = getCurrentPlan();

    if (!licensedProducts.some(({ prices }) => !isDefined(prices))) {
      throw new Error('Products prices are undefined.');
    }

    return licensedProducts
      .map(({ prices }) => prices)
      .flat()
      .find((price) => price && price.recurringInterval === interval);
  };

  const getPlanByPriceId = (priceId: string) => {
    return findOrThrow(
      listPlans(),
      (plan) =>
        plan.licensedProducts.some((product) =>
          product.prices?.some((price) => price.stripePriceId === priceId),
        ) ||
        plan.meteredProducts.some((product) =>
          product.prices?.some((price) => price.stripePriceId === priceId),
        ),
    );
  };

  return {
    // Plan
    getPlanByPriceId: getPlanByPriceId,
    getPlanByPlanKey: getPlanByPlanKey,
    getCurrentPlan: getCurrentPlan,
    // Price
    getPriceAndBillingUsageByPriceId: getPriceAndBillingUsageByPriceId,
    // License Price
    getBaseLicensedPriceByPlanKeyAndInterval:
      getBaseLicensedPriceByPlanKeyAndInterval,
    getCurrentLicensedPricesByInterval: getCurrentLicensedPricesByInterval,
    // Metered Price
    getCurrentMeteredBillingSubscriptionItem:
      getCurrentMeteredBillingSubscriptionItem,
    getCurrentMeteredBillingPrice: getCurrentMeteredBillingPrice,
    getCurrentMeteredPricesByInterval: getCurrentMeteredPricesByInterval,
    // Product
    listProdcuts: listProdcuts,
    getBaseProductByPlanKey: getBaseProductByPlanKey,
  };
};
