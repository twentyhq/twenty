import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupIdsComponentState = createComponentState<
  RecordGroupDefinition['id'][]
>({
  key: 'recordGroupIdsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
