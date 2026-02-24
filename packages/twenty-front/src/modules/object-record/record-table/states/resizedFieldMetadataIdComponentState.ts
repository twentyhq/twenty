import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type Nullable } from 'twenty-shared/types';

export const resizedFieldMetadataIdComponentState = createComponentStateV2<
  Nullable<string>
>({
  key: 'resizedFieldMetadataIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
