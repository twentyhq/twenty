import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isUpsertingActivityInDBState = createState<boolean>({
  key: 'isUpsertingActivityInDBState',
  defaultValue: false,
});
