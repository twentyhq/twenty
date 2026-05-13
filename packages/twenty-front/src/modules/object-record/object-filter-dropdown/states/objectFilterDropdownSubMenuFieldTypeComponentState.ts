import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Sentinel for the relation-traversal mode of the shared sub-menu state,
// distinguished from `CompositeFilterableFieldType`.
export const RELATION_SUB_MENU_FIELD_TYPE = 'RELATION' as const;

export type ObjectFilterDropdownSubMenuFieldType =
  | CompositeFilterableFieldType
  | typeof RELATION_SUB_MENU_FIELD_TYPE;

export const objectFilterDropdownSubMenuFieldTypeComponentState =
  createAtomComponentState<ObjectFilterDropdownSubMenuFieldType | null>({
    key: 'objectFilterDropdownSubMenuFieldTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
