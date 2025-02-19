import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const onEntityCountChangeComponentState = createComponentStateV2<
  ((entityCount?: number, currentRecordGroupId?: string) => void) | undefined
>({
  key: 'onEntityCountChangeComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
