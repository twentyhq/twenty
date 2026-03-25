import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerCalendarFieldMetadataIdComponentState =
  createAtomComponentState<string>({
    key: 'viewPickerCalendarFieldMetadataIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
