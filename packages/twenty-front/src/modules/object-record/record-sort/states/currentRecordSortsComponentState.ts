import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const currentRecordSortsComponentState = createAtomComponentState<
  RecordSort[]
>({
  key: 'currentRecordSortsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordSortsComponentInstanceContext,
});
