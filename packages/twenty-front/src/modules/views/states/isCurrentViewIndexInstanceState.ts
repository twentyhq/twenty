import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const isCurrentViewKeyIndexInstanceState = createInstanceState<boolean>({
  key: 'isCurrentViewKeyIndexInstanceState',
  defaultValue: true,
  instanceContext: ViewInstanceContext,
});
