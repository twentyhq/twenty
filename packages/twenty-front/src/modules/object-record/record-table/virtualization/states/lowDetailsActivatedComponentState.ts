import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const lowDetailsActivatedComponentState = createComponentState<boolean>({
  key: 'lowDetailsActivatedComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: false,
});
