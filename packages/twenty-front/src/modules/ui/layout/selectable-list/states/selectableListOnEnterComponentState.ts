import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const selectableListOnEnterComponentState = createComponentStateV2<
  ((itemId: string) => void) | undefined
>({
  key: 'selectableListOnEnterComponentState',
  defaultValue: undefined,
  componentInstanceContext: SelectableListComponentInstanceContext,
});
