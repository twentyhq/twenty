import { useLingui } from '@lingui/react/macro';
import { InterCustomerType } from '~/generated/graphql';

export const useInterCustomerTypeOptions = () => {
  const { t } = useLingui();

  const INTER_CUSTOMER_TYPE_OPTIONS = [
    {
      value: InterCustomerType.FISICA,
      label: t`Natural person`,
    },
    {
      value: InterCustomerType.JURIDICA,
      label: t`Legal person`,
    },
  ];

  return { INTER_CUSTOMER_TYPE_OPTIONS };
};
