import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsDirtyComponentState = createComponentStateV2<boolean>({
  key: 'viewPickerIsDirtyComponentState',
  defaultValue: false,
  componentInstanceContext: ViewComponentInstanceContext,
});
