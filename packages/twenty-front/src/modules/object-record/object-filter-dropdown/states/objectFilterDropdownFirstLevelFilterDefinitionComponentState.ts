import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const objectFilterDropdownFirstLevelFilterDefinitionComponentState =
  createComponentStateV2<RecordFilterDefinition | null>({
    key: 'objectFilterDropdownFirstLevelFilterDefinitionComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
