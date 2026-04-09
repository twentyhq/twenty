import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const currentRecordFieldsComponentState = createAtomComponentState<
  RecordField[]
>({
  key: 'currentRecordFieldsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFieldsComponentInstanceContext,
});
