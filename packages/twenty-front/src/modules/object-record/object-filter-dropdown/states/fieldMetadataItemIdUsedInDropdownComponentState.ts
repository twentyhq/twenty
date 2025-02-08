import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const fieldMetadataItemIdUsedInDropdownComponentState =
  createComponentStateV2<string | null>({
    key: 'fieldMetadataItemIdUsedInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
