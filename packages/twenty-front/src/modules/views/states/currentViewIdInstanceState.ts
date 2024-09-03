import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const currentViewIdInstanceState = createInstanceState<
  string | undefined
>({
  key: 'currentViewIdInstanceState',
  defaultValue: undefined,
  instanceContext: ViewInstanceContext,
});
