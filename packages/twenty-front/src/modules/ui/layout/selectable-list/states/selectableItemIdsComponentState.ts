import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const selectableItemIdsComponentState = createComponentState<string[][]>(
  {
    key: 'selectableItemIdsComponentState',
    defaultValue: [[]],
    componentInstanceContext: SelectableListComponentInstanceContext,
  },
);
