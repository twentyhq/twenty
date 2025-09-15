import {
  SubscriptionInterval,
  useListPlansQuery,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { findOrThrow } from '~/utils/array/findOrThrow';
import {
  BillingPlanKey,
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

  const isPlansLoaded = () => {
    return isDefined(plans?.listPlans);
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
    return findOrThrow(
      listPlans(),
      (plan) => plan.planKey === planKey,
      new Error(`Plan ${planKey} not found`),
    );
  };

  const getBaseProductByPlanKey = (planKey: BillingPlanKey) => {
    return findOrThrow(
      getPlanByPlanKey(planKey).licensedProducts,
      (product) =>
        product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
      new Error(`Base product not found`),
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
      new Error(`Base licensed price not found`),
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

  const getOppositPlan = () => {
    return getCurrentPlan().planKey === BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.PRO
      : BillingPlanKey.ENTERPRISE;
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
      new Error(`Current plan not found`),
    );
  };

  const getCurrentMeteredBillingSubscriptionItem = () => {
    const billingSubscriptionItems =
      getCurrentWorkspace().currentBillingSubscription
        ?.billingSubscriptionItems;

    if (!billingSubscriptionItems) {
      throw new Error('billingSubscriptionItems is undefined');
    }

    if (billingSubscriptionItems.length !== 2) {
      throw new Error(
        'billingSubscriptionItems is empty. It should contain two items: one for the base product and one for the workflow node execution product.',
      );
    }

    return findOrThrow(
      billingSubscriptionItems,
      (billingSubscriptionItem) =>
        billingSubscriptionItem.billingProduct.metadata?.['productKey'] ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      new Error(`Metered billing subscription items not found`),
    );
  };

  const getAllBillingPrices = () => {
    return listPlans()
      .map(({ licensedProducts, meteredProducts }) => {
        return [...licensedProducts, ...meteredProducts].map(
          ({ prices }) => prices,
        );
      })
      .flat(2) as Array<BillingPriceLicensedDto | BillingPriceMeteredDto>;
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

  const isMonthlyPlan =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Month;

  const isYearlyPlan =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Year;

  const isProPlan =
    currentWorkspace?.currentBillingSubscription?.metadata?.['plan'] ===
    BillingPlanKey.PRO;

  const isEnterprisePlan =
    currentWorkspace?.currentBillingSubscription?.metadata?.['plan'] ===
    BillingPlanKey.ENTERPRISE;

  return {
    // Plan
    getPlanByPriceId: getPlanByPriceId,
    getPlanByPlanKey: getPlanByPlanKey,
    getCurrentPlan: getCurrentPlan,
    isPlansLoaded: isPlansLoaded(),
    getOppositPlan: getOppositPlan,
    // Price
    getPriceAndBillingUsageByPriceId: getPriceAndBillingUsageByPriceId,
    getAllBillingPrices: getAllBillingPrices,
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
    // Current Workspace Flags
    isMonthlyPlan,
    isYearlyPlan,
    isProPlan,
    isEnterprisePlan,
  };
};
