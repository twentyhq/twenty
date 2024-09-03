import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerIsPersistingInstanceState = createInstanceState<boolean>(
  {
    key: 'viewPickerIsPersistingInstanceState',
    defaultValue: false,
    instanceContext: ViewInstanceContext,
  },
);
