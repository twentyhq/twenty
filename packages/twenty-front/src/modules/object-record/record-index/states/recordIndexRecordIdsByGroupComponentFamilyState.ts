import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordIdsByGroupComponentFamilyState =
  createComponentFamilyStateV2<string[], RecordGroupDefinition['id']>({
    key: 'recordIndexRecordIdsByGroupComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
