import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createComponentStateV2<CompositeFilterableFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
