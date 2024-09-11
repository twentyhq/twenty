import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerModeComponentState = createComponentStateV2<
  'list' | 'edit' | 'create'
>({
  key: 'viewPickerModeComponentState',
  defaultValue: 'list',
  componentInstanceContext: ViewComponentInstanceContext,
});
