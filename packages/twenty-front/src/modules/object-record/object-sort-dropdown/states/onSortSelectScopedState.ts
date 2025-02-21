import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const onSortSelectComponentState = createComponentStateV2<
  ((sort: RecordSort) => void) | undefined
>({
  key: 'onSortSelectComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
});
