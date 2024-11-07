import { RecordGroupDefinitionId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableRowIdsByGroupComponentState = createComponentStateV2<
  Map<RecordGroupDefinitionId, string[]>
>({
  key: 'tableRowIdsByGroupComponentFamilyState',
  defaultValue: new Map(),
  componentInstanceContext: RecordTableComponentInstanceContext,
});
