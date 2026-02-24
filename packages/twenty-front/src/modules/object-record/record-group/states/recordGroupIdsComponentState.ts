import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupIdsComponentState = createComponentStateV2<
  RecordGroupDefinition['id'][]
>({
  key: 'recordGroupIdsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
