import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type Nullable } from 'twenty-shared/types';

export const resizedRecordFieldIdComponentState = createAtomComponentState<
  Nullable<string>
>({
  key: 'resizedRecordFieldIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
