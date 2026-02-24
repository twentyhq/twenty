import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const lastScrollPositionComponentState = createComponentStateV2<number>({
  key: 'lastScrollPositionComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: 0,
});
