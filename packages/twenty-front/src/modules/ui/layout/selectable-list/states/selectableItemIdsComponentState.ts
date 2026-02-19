import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const selectableItemIdsComponentState = createComponentStateV2<
  string[][]
>({
  key: 'selectableItemIdsComponentState',
  defaultValue: [[]],
  componentInstanceContext: SelectableListComponentInstanceContext,
});
