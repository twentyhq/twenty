import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerSelectedIconInstanceState = createInstanceState<string>({
  key: 'viewPickerSelectedIconInstanceState',
  defaultValue: '',
  instanceContext: ViewInstanceContext,
});
