import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewObjectMetadataIdInstanceState = createInstanceState<
  string | undefined
>({
  key: 'viewObjectMetadataIdInstanceState',
  defaultValue: undefined,
  instanceContext: ViewInstanceContext,
});
