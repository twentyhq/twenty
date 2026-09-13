import { type ViewManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export type ViewChildrenManifests = Pick<
  ViewManifest,
  'fields' | 'filters' | 'filterGroups' | 'groups' | 'fieldGroups' | 'sorts'
>;

const withoutEmptyCollections = ({
  fields,
  filters,
  filterGroups,
  groups,
  fieldGroups,
  sorts,
}: ViewChildrenManifests): ViewChildrenManifests => ({
  ...(isNonEmptyArray(fields) ? { fields } : {}),
  ...(isNonEmptyArray(filters) ? { filters } : {}),
  ...(isNonEmptyArray(filterGroups) ? { filterGroups } : {}),
  ...(isNonEmptyArray(groups) ? { groups } : {}),
  ...(isNonEmptyArray(fieldGroups) ? { fieldGroups } : {}),
  ...(isNonEmptyArray(sorts) ? { sorts } : {}),
});

export const fromFlatViewToViewManifest = ({
  flatView,
  children = {},
}: {
  flatView: UniversalFlatView;
  children?: ViewChildrenManifests;
}): ViewManifest => ({
  universalIdentifier: flatView.universalIdentifier,
  name: flatView.name,
  objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
  type: flatView.type,
  icon: flatView.icon,
  position: flatView.position,
  isCompact: flatView.isCompact,
  visibility: flatView.visibility,
  openRecordIn: flatView.openRecordIn,
  shouldHideEmptyGroups: flatView.shouldHideEmptyGroups,
  ...(isDefined(flatView.mainGroupByFieldMetadataUniversalIdentifier)
    ? {
        mainGroupByFieldMetadataUniversalIdentifier:
          flatView.mainGroupByFieldMetadataUniversalIdentifier,
      }
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
  ...withoutEmptyCollections(children),
});
