import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { CurrentViewComponentInstanceContext } from '@/views/states/contexts/CurrentViewComponentInstanceContext';

export const recordGroupDefinitionState = createComponentStateV2<
  RecordGroupDefinition[]
>({
  key: 'recordGroupDefinitionState',
  defaultValue: [],
  componentInstanceContext: CurrentViewComponentInstanceContext,
});
