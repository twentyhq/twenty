import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const isPersistingViewFieldsInstanceState = createInstanceState<boolean>(
  {
    key: 'isPersistingViewFieldsInstanceState',
    defaultValue: false,
    instanceContext: ViewInstanceContext,
  },
);
