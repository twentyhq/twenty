import { v4 } from 'uuid';

import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const fromPartialFlatViewToFlatViewWithDefault = (
  partialFlatView: Partial<FlatView>,
): FlatView => {
  const createdAt = new Date();
  const viewId = partialFlatView.id ?? v4();

  return {
    ...partialFlatView,
    id: viewId,
    name: partialFlatView.name ?? '',
    objectMetadataId: partialFlatView.objectMetadataId ?? '',
    type: partialFlatView.type ?? ViewType.TABLE,
    key: partialFlatView.key ?? null,
    icon: partialFlatView.icon ?? '',
    position: partialFlatView.position ?? 0,
    isCompact: partialFlatView.isCompact ?? false,
    isCustom: partialFlatView.isCustom ?? false,
    openRecordIn: partialFlatView.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    kanbanAggregateOperation: partialFlatView.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      partialFlatView.kanbanAggregateOperationFieldMetadataId ?? null,
    workspaceId: partialFlatView.workspaceId ?? '',
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    anyFieldFilterValue: partialFlatView.anyFieldFilterValue ?? null,
    universalIdentifier: partialFlatView.universalIdentifier ?? viewId,
    viewFieldIds: partialFlatView.viewFieldIds ?? [],
    calendarLayout: partialFlatView.calendarLayout ?? null,
    calendarFieldMetadataId: partialFlatView.calendarFieldMetadataId ?? null,
  };
};
