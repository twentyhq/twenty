import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeComponentState = createAtomComponentState<ViewType>({
  key: 'viewPickerTypeComponentState',
  defaultValue: ViewType.Table,
  componentInstanceContext: ViewComponentInstanceContext,
});
