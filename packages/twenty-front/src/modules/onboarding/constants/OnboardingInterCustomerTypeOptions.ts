import { msg } from '@lingui/core/macro';
import { InterCustomerType } from '~/generated/graphql';

export const INTER_CUSTOMER_TYPE_OPTIONS = [
  {
    value: InterCustomerType.FISICA,
    label: msg`Natural person`,
  },
  {
    value: InterCustomerType.JURIDICA,
    label: msg`Legal person`,
  },
];
