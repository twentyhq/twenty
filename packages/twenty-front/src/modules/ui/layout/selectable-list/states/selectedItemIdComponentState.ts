import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const selectedItemIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'selectedItemIdComponentState',
  defaultValue: null,
  componentInstanceContext: SelectableListComponentInstanceContext,
});
