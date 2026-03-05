import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const isSelectedItemIdComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'isSelectedItemIdComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: SelectableListComponentInstanceContext,
  });
