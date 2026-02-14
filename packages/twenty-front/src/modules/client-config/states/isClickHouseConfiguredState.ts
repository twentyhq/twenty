import { createState } from '@/ui/utilities/state/utils/createState';

export const isClickHouseConfiguredState = createState<boolean>({
  key: 'isClickHouseConfigured',
  defaultValue: false,
});
