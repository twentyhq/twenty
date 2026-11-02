import { type ApplicationBilling } from 'twenty-shared/application';

export const listDeclaredBillingChargeNames = ({
  billing,
}: {
  billing:
    | Pick<ApplicationBilling, 'recurring' | 'operations'>
    | null
    | undefined;
}): string[] => [
  ...Object.keys(billing?.recurring ?? {}),
  ...Object.keys(billing?.operations ?? {}),
];
