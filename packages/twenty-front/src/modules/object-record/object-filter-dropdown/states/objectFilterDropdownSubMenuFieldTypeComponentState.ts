import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createAtomComponentState<CompositeFilterableFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
