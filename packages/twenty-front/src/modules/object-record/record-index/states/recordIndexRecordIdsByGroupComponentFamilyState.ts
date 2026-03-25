import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordIdsByGroupComponentFamilyState =
  createAtomComponentFamilyState<string[], RecordGroupDefinition['id']>({
    key: 'recordIndexRecordIdsByGroupComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
