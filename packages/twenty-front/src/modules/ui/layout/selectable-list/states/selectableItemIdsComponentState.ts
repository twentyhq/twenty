import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const selectableItemIdsComponentState = createAtomComponentState<
  string[][]
>({
  key: 'selectableItemIdsComponentState',
  defaultValue: [[]],
  componentInstanceContext: SelectableListComponentInstanceContext,
});
