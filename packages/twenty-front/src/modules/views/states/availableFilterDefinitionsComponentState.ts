import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const availableFilterDefinitionsComponentState = createComponentStateV2<
  RecordFilterDefinition[]
>({
  key: 'availableFilterDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
