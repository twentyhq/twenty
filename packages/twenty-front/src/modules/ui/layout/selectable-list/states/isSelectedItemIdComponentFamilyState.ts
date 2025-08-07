import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isSelectedItemIdComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isSelectedItemIdComponentFamilyState',
  defaultValue: false,
  componentInstanceContext: SelectableListComponentInstanceContext,
});
