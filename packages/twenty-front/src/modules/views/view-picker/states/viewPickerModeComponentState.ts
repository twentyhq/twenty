import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewPickerMode } from '@/views/view-picker/types/ViewPickerMode';

export const viewPickerModeComponentState =
  createAtomComponentState<ViewPickerMode>({
    key: 'viewPickerModeComponentState',
    defaultValue: 'list',
    componentInstanceContext: ViewComponentInstanceContext,
  });
