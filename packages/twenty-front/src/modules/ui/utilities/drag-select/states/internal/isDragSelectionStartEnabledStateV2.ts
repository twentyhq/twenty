import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isDragSelectionStartEnabledStateV2 = createStateV2<boolean>({
  key: 'drag-select/isDragSelectionStartEnabledStateV2',
  defaultValue: true,
});
