import {
  type ViewFieldManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const fromFlatViewToViewManifest = ({
  flatView,
  fields,
}: {
  flatView: FlatView;
  fields: ViewFieldManifest[];
}): ViewManifest => {
  return {
    universalIdentifier: flatView.universalIdentifier,
    name: flatView.name,
    objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
    type: flatView.type,
    ...(isDefined(flatView.key) ? { key: flatView.key } : {}),
    ...(isDefined(flatView.icon) ? { icon: flatView.icon } : {}),
    position: flatView.position,
    isCompact: flatView.isCompact,
    ...(isDefined(flatView.visibility)
      ? { visibility: flatView.visibility }
      : {}),
    ...(isDefined(flatView.openRecordIn)
      ? { openRecordIn: flatView.openRecordIn }
      : {}),
    ...(isDefined(flatView.mainGroupByFieldMetadataUniversalIdentifier)
      ? {
          mainGroupByFieldMetadataUniversalIdentifier:
            flatView.mainGroupByFieldMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatView.shouldHideEmptyGroups)
      ? { shouldHideEmptyGroups: flatView.shouldHideEmptyGroups }
      : {}),
    ...(isDefined(flatView.anyFieldFilterValue)
      ? { anyFieldFilterValue: flatView.anyFieldFilterValue }
      : {}),
    ...(isDefined(flatView.kanbanColumnWidth)
      ? { kanbanColumnWidth: flatView.kanbanColumnWidth }
      : {}),
    ...(isDefined(flatView.kanbanAggregateOperation)
      ? { kanbanAggregateOperation: flatView.kanbanAggregateOperation }
      : {}),
    ...(isDefined(
      flatView.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    )
      ? {
          kanbanAggregateOperationFieldMetadataUniversalIdentifier:
            flatView.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatView.calendarLayout)
      ? { calendarLayout: flatView.calendarLayout }
      : {}),
    ...(isDefined(flatView.calendarFieldMetadataUniversalIdentifier)
      ? {
          calendarFieldMetadataUniversalIdentifier:
            flatView.calendarFieldMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatView.calendarEndFieldMetadataUniversalIdentifier)
      ? {
          calendarEndFieldMetadataUniversalIdentifier:
            flatView.calendarEndFieldMetadataUniversalIdentifier,
        }
      : {}),
    ...(flatView.isActive === false ? { isActive: false } : {}),
    fields,
  };
};
