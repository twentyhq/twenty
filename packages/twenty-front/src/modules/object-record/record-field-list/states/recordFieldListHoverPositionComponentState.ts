import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordFieldListHoverPositionComponentState = createComponentState<
  number | null
>({
  key: 'recordFieldListHoverPositionComponentState',
  defaultValue: null,
  componentInstanceContext: RecordFieldListComponentInstanceContext,
});
