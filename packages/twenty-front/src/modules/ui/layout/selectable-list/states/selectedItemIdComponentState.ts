import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const selectedItemIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'selectedItemIdComponentState',
  defaultValue: null,
  componentInstanceContext: SelectableListComponentInstanceContext,
});
