import { RELATION_SUB_MENU_FIELD_TYPE } from '@/object-record/object-filter-dropdown/constants/RelationSubMenuFieldType';
import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';

export type ObjectFilterDropdownSubMenuFieldType =
  | CompositeFilterableFieldType
  | typeof RELATION_SUB_MENU_FIELD_TYPE;
