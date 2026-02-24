import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupIdsComponentState = createComponentState<
  RecordGroupDefinition['id'][]
>({
  key: 'recordGroupIdsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
