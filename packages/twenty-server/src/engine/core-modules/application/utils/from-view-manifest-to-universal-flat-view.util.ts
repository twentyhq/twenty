import { type ViewManifest } from 'twenty-shared/application';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

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
    type: viewManifest.type ?? ViewType.TABLE,
    icon: viewManifest.icon ?? 'IconList',
    position: viewManifest.position ?? 0,
    isCompact: viewManifest.isCompact ?? false,
    isCustom: true,
    visibility: viewManifest.visibility ?? ViewVisibility.WORKSPACE,
    openRecordIn: viewManifest.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
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
