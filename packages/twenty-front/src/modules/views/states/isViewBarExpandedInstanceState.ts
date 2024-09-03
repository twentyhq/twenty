import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const isViewBarExpandedInstanceState = createInstanceState<boolean>({
  key: 'isViewBarExpandedInstanceState',
  defaultValue: true,
  instanceContext: ViewInstanceContext,
});
