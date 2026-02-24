import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewObjectMetadataIdComponentState = createComponentState<
  string | undefined
>({
  key: 'viewObjectMetadataIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ViewComponentInstanceContext,
});
