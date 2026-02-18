import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isMergeInProgressState = createStateV2<boolean>({
  key: 'isMergeInProgress',
  defaultValue: false,
});
