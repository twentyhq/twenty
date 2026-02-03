import { createState } from 'twenty-ui/utilities';

export const isClickHouseConfiguredState = createState<boolean>({
  key: 'isClickHouseConfigured',
  defaultValue: false,
});
