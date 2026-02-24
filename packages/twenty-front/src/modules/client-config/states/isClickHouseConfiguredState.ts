import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isClickHouseConfiguredState = createStateV2<boolean>({
  key: 'isClickHouseConfigured',
  defaultValue: false,
});
