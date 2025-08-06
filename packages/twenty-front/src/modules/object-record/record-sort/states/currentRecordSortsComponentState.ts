import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentRecordSortsComponentState = createComponentState<
  RecordSort[]
>({
  key: 'currentRecordSortsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordSortsComponentInstanceContext,
});
