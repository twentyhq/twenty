import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerStartFieldMetadataIdComponentState =
  createAtomComponentState<string>({
    key: 'viewPickerStartFieldMetadataIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
