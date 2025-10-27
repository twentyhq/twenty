import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const selectableItemIdsComponentState = createComponentState<string[][]>(
  {
    key: 'selectableItemIdsComponentState',
    defaultValue: [[]],
    componentInstanceContext: SelectableListComponentInstanceContext,
  },
);
