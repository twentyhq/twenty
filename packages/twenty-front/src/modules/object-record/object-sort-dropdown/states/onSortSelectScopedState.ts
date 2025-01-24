import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { Sort } from '../types/Sort';

export const onSortSelectComponentState = createComponentStateV2<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
});
