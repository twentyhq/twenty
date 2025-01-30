import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const filterDefinitionUsedInDropdownComponentState =
  createComponentStateV2<RecordFilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
