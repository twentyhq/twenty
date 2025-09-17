import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const FLAT_VIEW_FIELD_EDITABLE_PROPERTIES = [
  'isVisible',
  'size',
  'position',
  'aggregateOperation',
] as const satisfies (keyof FlatViewField)[];
