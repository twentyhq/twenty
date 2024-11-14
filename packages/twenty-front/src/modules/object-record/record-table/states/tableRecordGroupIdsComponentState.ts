import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableRecordGroupIdsComponentState = createComponentStateV2<
  RecordGroupDefinition['id'][]
>({
  key: 'tableRecordGroupIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
