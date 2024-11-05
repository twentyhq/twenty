import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const resizedFieldKeyComponentState = createComponentStateV2<
  string | null
>({
  key: 'resizedFieldKeyComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
