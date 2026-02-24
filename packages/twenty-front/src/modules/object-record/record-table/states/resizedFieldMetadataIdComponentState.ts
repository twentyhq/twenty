import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { type Nullable } from 'twenty-shared/types';

export const resizedFieldMetadataIdComponentState = createComponentState<
  Nullable<string>
>({
  key: 'resizedFieldMetadataIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
