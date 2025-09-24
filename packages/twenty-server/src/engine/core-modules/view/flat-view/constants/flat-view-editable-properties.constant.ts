import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const FLAT_VIEW_EDITABLE_PROPERTIES = [
  'name',
  'type',
  'icon',
  'position',
  'isCompact',
  'openRecordIn',
  'kanbanAggregateOperation',
  'kanbanAggregateOperationFieldMetadataId',
  'anyFieldFilterValue',
  'calendarLayout',
  'calendarFieldMetadataId',
] as const satisfies (keyof FlatView)[];
