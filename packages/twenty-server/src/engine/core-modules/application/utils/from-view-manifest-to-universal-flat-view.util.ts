import { type ViewManifest } from 'twenty-shared/application';

import { type ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { type ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { type ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromViewManifestToUniversalFlatView = ({
  viewManifest,
  applicationUniversalIdentifier,
  now,
}: {
  viewManifest: ViewManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatView => {
  return {
    universalIdentifier: viewManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: viewManifest.name,
    objectMetadataUniversalIdentifier: viewManifest.objectUniversalIdentifier,
    type: (viewManifest.type ?? 'TABLE') as ViewType,
    icon: viewManifest.icon ?? 'IconList',
    position: viewManifest.position ?? 0,
    isCompact: viewManifest.isCompact ?? false,
    isCustom: true,
    visibility: (viewManifest.visibility ?? 'WORKSPACE') as ViewVisibility,
    openRecordIn: (viewManifest.openRecordIn ??
      'SIDE_PANEL') as ViewOpenRecordIn,
    key: null,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    calendarLayout: null,
    calendarFieldMetadataUniversalIdentifier: null,
    mainGroupByFieldMetadataUniversalIdentifier: null,
    shouldHideEmptyGroups: false,
    anyFieldFilterValue: null,
    createdByUserWorkspaceId: null,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
