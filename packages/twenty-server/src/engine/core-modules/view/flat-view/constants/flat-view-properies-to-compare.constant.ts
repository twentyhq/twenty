import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const FLAT_VIEW_PROPERTIES_TO_COMPARE = [
  'name',
  'type',
  'key',
  'isCompact',
  'openRecordIn',
  'kanbanAggregateOperation',
  'kanbanAggregateOperationFieldMetadataId',
  'position',
  'anyFieldFilterValue',
  'icon',
] as const satisfies (keyof FlatView)[];
