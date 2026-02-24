import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isDragSelectionStartEnabledStateV2 = createState<boolean>({
  key: 'drag-select/isDragSelectionStartEnabledStateV2',
  defaultValue: true,
});
