import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableSortsComponentState = createComponentStateV2<RecordSort[]>({
  key: 'tableSortsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
