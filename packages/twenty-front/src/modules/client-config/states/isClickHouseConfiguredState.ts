import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isClickHouseConfiguredState = createState<boolean>({
  key: 'isClickHouseConfigured',
  defaultValue: false,
});
