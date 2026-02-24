import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createComponentStateV2<CompositeFilterableFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
