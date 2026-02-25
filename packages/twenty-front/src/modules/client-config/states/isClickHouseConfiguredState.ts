import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isClickHouseConfiguredState = createAtomState<boolean>({
  key: 'isClickHouseConfigured',
  defaultValue: false,
});
