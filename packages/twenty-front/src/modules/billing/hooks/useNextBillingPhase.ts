import {
  type BillingPriceLicensedDto,
  BillingUsageType,
} from '~/generated/graphql';
import type { MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { findOrThrow } from 'twenty-shared/utils';

export const useNextBillingPhase = () => {
  const { getPriceAndBillingUsageByPriceId, getPlanByPriceId } =
    useBillingPlan();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const hasNextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases.length === 2;

  const nextBillingPhaseItems = hasNextBillingPhase
    ? currentWorkspace?.currentBillingSubscription?.phases[1]?.items!
    : [];

  const splitPhaseItemsInPrices = (): {
    nextMereredPrice: MeteredBillingPrice;
    nextLicensedPrice: BillingPriceLicensedDto;
  } => {
    return nextBillingPhaseItems.reduce(
      (acc, item) => {
        const { price, billingUsage } = getPriceAndBillingUsageByPriceId(
          item.price,
        );
        if (billingUsage === BillingUsageType.LICENSED) {
          acc.nextLicensedPrice = price;
        }
        if (billingUsage === BillingUsageType.METERED) {
          acc.nextMereredPrice = price as MeteredBillingPrice;
        }
        return acc;
      },
      {} as {
        nextMereredPrice: MeteredBillingPrice;
        nextLicensedPrice: BillingPriceLicensedDto;
      },
    );
  };

  const getNextMeteredPrice = () => {
    const { nextMereredPrice } = splitPhaseItemsInPrices();
    return nextMereredPrice;
  };

  const getNextPlan = () => {
    const { nextLicensedPrice } = splitPhaseItemsInPrices();
    return getPlanByPriceId(nextLicensedPrice.stripePriceId);
  };

  const getNextInterval = () => {
    const { nextLicensedPrice } = splitPhaseItemsInPrices();
    return nextLicensedPrice.recurringInterval;
  };

  const getNextBillingSeats = () => {
    const { nextLicensedPrice } = splitPhaseItemsInPrices();
    return findOrThrow(
      nextBillingPhaseItems,
      ({ price }) => nextLicensedPrice.stripePriceId === price,
    ).quantity;
  };

  return {
    hasNextBillingPhase,
    nextBillingPhaseItems,
    splitPhaseItemsInPrices,
    getNextPlan,
    getNextInterval,
    getNextMeteredPrice,
    getNextBillingSeats,
  };
};
