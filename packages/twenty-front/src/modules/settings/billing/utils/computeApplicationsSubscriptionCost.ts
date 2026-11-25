import { isDefined } from 'twenty-shared/utils';

type ApplicationSubscriptionItem = {
  applicationName?: string | null;
  quantity?: number | null;
  unitAmount?: number | null;
};

export const computeApplicationsSubscriptionCost = <
  TItem extends ApplicationSubscriptionItem,
>(
  billingSubscriptionItems: TItem[] | null | undefined,
) => {
  const applicationSubscriptionItems =
    billingSubscriptionItems?.filter((billingSubscriptionItem) =>
      isDefined(billingSubscriptionItem.applicationName),
    ) ?? [];

  const applicationsCount = new Set(
    applicationSubscriptionItems.map(
      (applicationSubscriptionItem) =>
        applicationSubscriptionItem.applicationName,
    ),
  ).size;

  const applicationsSubtotalCents = applicationSubscriptionItems.reduce<
    number | undefined
  >(
    (subtotalCents, { quantity, unitAmount }) =>
      isDefined(subtotalCents) && isDefined(quantity) && isDefined(unitAmount)
        ? subtotalCents + quantity * unitAmount
        : undefined,
    0,
  );

  return {
    applicationSubscriptionItems,
    applicationsCount,
    applicationsSubtotalCents,
  };
};
