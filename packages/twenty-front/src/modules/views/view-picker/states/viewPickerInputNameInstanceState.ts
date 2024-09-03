import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerInputNameInstanceState = createInstanceState<string>({
  key: 'viewPickerInputNameInstanceState',
  defaultValue: '',
  instanceContext: ViewInstanceContext,
});
