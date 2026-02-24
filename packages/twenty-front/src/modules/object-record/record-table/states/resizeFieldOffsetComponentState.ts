import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const resizeFieldOffsetComponentState = createComponentState<number>({
  key: 'resizeFieldOffsetComponentState',
  defaultValue: 0,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
