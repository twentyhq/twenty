import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isMergeInProgressState = createState<boolean>({
  key: 'isMergeInProgress',
  defaultValue: false,
});
