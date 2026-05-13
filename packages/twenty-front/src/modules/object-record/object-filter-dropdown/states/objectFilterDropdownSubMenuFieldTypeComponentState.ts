import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Composite filterable types open a sub-menu for sub-field selection. MANY_TO_ONE
// relations reuse the same sub-menu pattern to let the user pick a field on
// the related object (one-hop relation traversal).
export type ObjectFilterDropdownSubMenuFieldType =
  | CompositeFilterableFieldType
  | 'RELATION';

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createAtomComponentState<ObjectFilterDropdownSubMenuFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
