import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentRecordFieldsComponentState = createComponentState<
  RecordField[]
>({
  key: 'currentRecordFieldsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFieldsComponentInstanceContext,
});
