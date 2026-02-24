import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewObjectMetadataIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'viewObjectMetadataIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ViewComponentInstanceContext,
});
