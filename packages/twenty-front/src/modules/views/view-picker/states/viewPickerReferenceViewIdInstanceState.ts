import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerReferenceViewIdInstanceState =
  createInstanceState<string>({
    key: 'viewPickerReferenceViewIdInstanceState',
    defaultValue: '',
    instanceContext: ViewInstanceContext,
  });
