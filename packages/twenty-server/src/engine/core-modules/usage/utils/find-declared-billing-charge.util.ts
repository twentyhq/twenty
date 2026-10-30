import { type ApplicationBilling } from 'twenty-shared/application';

// Own-property only: a charge named `constructor` must not resolve to an inherited value
export const findDeclaredBillingCharge = ({
  billing,
  chargeName,
}: {
  billing:
    | Pick<ApplicationBilling, 'recurring' | 'operations'>
    | null
    | undefined;
  chargeName: string;
}): { label: string; icon?: string } | undefined => {
  const declaredCharges: Partial<
    Record<string, { label: string; icon?: string }>
  > = {
    ...(billing?.recurring ?? {}),
    ...(billing?.operations ?? {}),
  };

  return Object.prototype.hasOwnProperty.call(declaredCharges, chargeName)
    ? declaredCharges[chargeName]
    : undefined;
};
