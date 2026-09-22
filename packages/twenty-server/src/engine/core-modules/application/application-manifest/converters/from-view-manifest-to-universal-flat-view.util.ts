import { type ViewManifest } from 'twenty-shared/application';
import {
  DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  VIEW_GROUP_LOAD_LIMIT_OPTIONS,
} from 'twenty-shared/constants';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined, isSupportedViewGroupLoadLimit } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

const getViewManifestGroupLoadLimitOrThrow = (
  viewManifest: ViewManifest,
): number => {
  const groupLoadLimit = viewManifest.groupLoadLimit;

  if (!isDefined(groupLoadLimit)) {
    return DEFAULT_VIEW_GROUP_LOAD_LIMIT;
  }

  if (!isSupportedViewGroupLoadLimit(groupLoadLimit)) {
    const viewName = viewManifest.name;
    const allowedGroupLoadLimits = VIEW_GROUP_LOAD_LIMIT_OPTIONS.join(', ');

    throw new ApplicationException(
      `View "${viewName}" has an unsupported groupLoadLimit ${groupLoadLimit}, expected one of ${allowedGroupLoadLimits}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return groupLoadLimit;
};

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
    kanbanAggregateOperation: viewManifest.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier:
      viewManifest.kanbanAggregateOperationFieldMetadataUniversalIdentifier ??
      null,
    calendarLayout: viewManifest.calendarLayout ?? null,
    calendarFieldMetadataUniversalIdentifier:
      viewManifest.calendarFieldMetadataUniversalIdentifier ?? null,
    calendarEndFieldMetadataUniversalIdentifier:
      viewManifest.calendarEndFieldMetadataUniversalIdentifier ?? null,
    mainGroupByFieldMetadataUniversalIdentifier:
      viewManifest.mainGroupByFieldMetadataUniversalIdentifier ?? null,
    shouldHideEmptyGroups: viewManifest.shouldHideEmptyGroups ?? false,
    kanbanColumnWidth: viewManifest.kanbanColumnWidth ?? null,
    groupLoadLimit: getViewManifestGroupLoadLimitOrThrow(viewManifest),
    anyFieldFilterValue: viewManifest.anyFieldFilterValue ?? null,
    createdByUserWorkspaceId: null,
    isActive: true,
    isSystemSideEffect: false,
    universalOverrides: null,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
