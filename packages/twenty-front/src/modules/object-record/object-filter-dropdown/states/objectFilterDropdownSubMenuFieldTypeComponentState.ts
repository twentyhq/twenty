import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type ObjectFilterDropdownSubMenuFieldType } from '@/object-record/record-filter/types/ObjectFilterDropdownSubMenuFieldType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createAtomComponentState<ObjectFilterDropdownSubMenuFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
