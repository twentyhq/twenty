import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerCalendarFieldMetadataIdComponentState =
  createComponentStateV2<string>({
    key: 'viewPickerCalendarFieldMetadataIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
