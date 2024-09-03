import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerIsDirtyInstanceState = createInstanceState<boolean>({
  key: 'viewPickerIsDirtyInstanceState',
  defaultValue: false,
  instanceContext: ViewInstanceContext,
});
