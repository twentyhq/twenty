import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isUpsertingActivityInDBState = createStateV2<boolean>({
  key: 'isUpsertingActivityInDBState',
  defaultValue: false,
});
