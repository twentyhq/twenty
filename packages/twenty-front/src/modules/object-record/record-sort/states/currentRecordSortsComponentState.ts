import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const currentRecordSortsComponentState = createComponentStateV2<
  RecordSort[]
>({
  key: 'currentRecordSortsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordSortsComponentInstanceContext,
});
