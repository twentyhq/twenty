import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexHasFetchedAllRecordsByGroupComponentState =
  createComponentFamilyState<boolean, RecordGroupDefinition['id']>({
    key: 'recordIndexHasFetchedAllRecordsByGroupComponentState',
    componentInstanceContext: ViewComponentInstanceContext,
    defaultValue: false,
  });
