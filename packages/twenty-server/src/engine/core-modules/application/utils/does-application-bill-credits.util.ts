import { type ApplicationBilling } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const doesApplicationBillCredits = (
  billing: ApplicationBilling | undefined,
): boolean =>
  Object.values(billing?.operations ?? {}).some(isDefined) ||
  Object.values(billing?.recurring ?? {}).some(isDefined);
