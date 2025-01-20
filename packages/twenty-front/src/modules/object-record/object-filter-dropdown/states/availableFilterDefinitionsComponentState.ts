import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const availableFilterDefinitionsComponentState = createComponentStateV2<
  RecordFilterDefinition[]
>({
  key: 'availableFilterDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
