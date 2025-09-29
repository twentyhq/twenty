import { type ViewEntityRelationProperties } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const VIEW_ENTITY_RELATION_PROPERTIES = [
  'objectMetadata',
  'viewFields',
  'viewFilters',
  'viewFilterGroups',
  'viewGroups',
  'viewSorts',
  'workspace',
] as const satisfies ViewEntityRelationProperties[];
