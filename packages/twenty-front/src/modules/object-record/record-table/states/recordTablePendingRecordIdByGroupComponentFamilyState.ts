import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const recordTablePendingRecordIdByGroupComponentFamilyState =
  createComponentFamilyStateV2<string | null, RecordGroupDefinition['id']>({
    key: 'recordTablePendingRecordIdByGroupComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
