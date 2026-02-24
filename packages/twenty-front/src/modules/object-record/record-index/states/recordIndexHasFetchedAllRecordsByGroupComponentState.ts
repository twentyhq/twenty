import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexHasFetchedAllRecordsByGroupComponentState =
  createComponentFamilyStateV2<boolean, RecordGroupDefinition['id']>({
    key: 'recordIndexHasFetchedAllRecordsByGroupComponentState',
    componentInstanceContext: ViewComponentInstanceContext,
    defaultValue: false,
  });
