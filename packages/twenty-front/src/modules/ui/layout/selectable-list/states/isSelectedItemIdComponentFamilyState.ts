import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const isSelectedItemIdComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'isSelectedItemIdComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: SelectableListComponentInstanceContext,
  });
