import { InterCustomerUf } from '~/generated/graphql';

export const INTER_STATE_UNITY_OPTIONS = Object.values(InterCustomerUf).map(
  (uf) => ({
    value: uf,
    label: uf,
  }),
);
