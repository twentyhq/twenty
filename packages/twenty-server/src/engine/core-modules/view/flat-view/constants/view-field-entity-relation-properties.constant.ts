import { type ViewFieldEntityRelationProperties } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const VIEW_FIELD_ENTITY_RELATION_PROPERTIES = [
  'fieldMetadata',
  'view',
  'workspace',
] as const satisfies ViewFieldEntityRelationProperties[];
