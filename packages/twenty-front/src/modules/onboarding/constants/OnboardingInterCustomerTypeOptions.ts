import { t } from '@lingui/core/macro';
import { InterCustomerType } from '~/generated/graphql';

export const INTER_CUSTOMER_TYPE_OPTIONS = [
  {
    value: InterCustomerType.FISICA,
    label: t`Natural person`,
  },
  {
    value: InterCustomerType.JURIDICA,
    label: t`Legal person`,
  },
];
