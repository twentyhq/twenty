import { createState } from '@/ui/utilities/state/utils/createState';

export const isMergeInProgressState = createState<boolean>({
  key: 'isMergeInProgress',
  defaultValue: false,
});
