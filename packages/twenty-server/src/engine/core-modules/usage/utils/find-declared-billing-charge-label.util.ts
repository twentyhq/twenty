import { type ApplicationBilling } from 'twenty-shared/application';

// Own-property only: a charge named `constructor` must not resolve to an inherited value
export const findDeclaredBillingChargeLabel = ({
  billing,
  chargeName,
}: {
  billing:
    | Pick<ApplicationBilling, 'recurring' | 'operations'>
    | null
    | undefined;
  chargeName: string;
}): string | undefined => {
  const declaredCharges = {
    ...(billing?.recurring ?? {}),
    ...(billing?.operations ?? {}),
  };

  return Object.prototype.hasOwnProperty.call(declaredCharges, chargeName)
    ? declaredCharges[chargeName]?.label
    : undefined;
};
