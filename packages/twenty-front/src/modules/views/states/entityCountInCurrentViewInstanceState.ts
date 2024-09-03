import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const entityCountInCurrentViewInstanceState = createInstanceState<
  number | undefined
>({
  key: 'entityCountInCurrentViewInstanceState',
  defaultValue: undefined,
  instanceContext: ViewInstanceContext,
});
