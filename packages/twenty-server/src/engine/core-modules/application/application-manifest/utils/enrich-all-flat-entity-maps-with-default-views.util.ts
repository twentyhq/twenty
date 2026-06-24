import { getIndexViewUniversalIdentifier } from 'twenty-shared/application';
import {
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

const buildDefaultIndexFlatView = ({
  flatObjectMetadata,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatView => ({
  universalIdentifier: viewUniversalIdentifier,
  applicationUniversalIdentifier,
  name: `All {objectLabelPlural}`,
  objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconList',
  position: 0,
  isCompact: false,
  isCustom: true,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  key: ViewKey.INDEX,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
  calendarLayout: null,
  calendarFieldMetadataUniversalIdentifier: null,
  mainGroupByFieldMetadataUniversalIdentifier: null,
  shouldHideEmptyGroups: false,
  kanbanColumnWidth: null,
  anyFieldFilterValue: null,
  createdByUserWorkspaceId: null,
  isActive: true,
  isSystemSideEffect: true,
  universalOverrides: null,
  viewFieldUniversalIdentifiers: [],
  viewFilterUniversalIdentifiers: [],
  viewFilterGroupUniversalIdentifiers: [],
  viewGroupUniversalIdentifiers: [],
  viewFieldGroupUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [],
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

export const enrichAllFlatEntityMapsWithDefaultViews = ({
  allFlatEntityMaps,
  flatApplication,
  now,
}: {
  allFlatEntityMaps: AllFlatEntityMaps;
  flatApplication: FlatApplication;
  now: string;
}): void => {
  const fieldsByObjectUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadata[]
  >();

  for (const flatFieldMetadata of Object.values(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    const objectFlatFieldMetadatas =
      fieldsByObjectUniversalIdentifier.get(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
      ) ?? [];

    if (objectFlatFieldMetadatas.length === 0) {
      fieldsByObjectUniversalIdentifier.set(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
        objectFlatFieldMetadatas,
      );
    }

    objectFlatFieldMetadatas.push(flatFieldMetadata);
  }

  for (const flatObjectMetadata of Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    if (
      flatObjectMetadata.applicationUniversalIdentifier !==
      flatApplication.universalIdentifier
    ) {
      continue;
    }

    const indexViewUniversalIdentifier = getIndexViewUniversalIdentifier({
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    });

    if (
      isDefined(
        allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
          indexViewUniversalIdentifier
        ],
      )
    ) {
      continue;
    }

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: buildDefaultIndexFlatView({
        flatObjectMetadata,
        viewUniversalIdentifier: indexViewUniversalIdentifier,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate: allFlatEntityMaps.flatViewMaps,
    });

    const flatViewFields = computeFlatViewFieldsToCreate({
      flatApplication,
      objectFlatFieldMetadatas:
        fieldsByObjectUniversalIdentifier.get(
          flatObjectMetadata.universalIdentifier,
        ) ?? [],
      viewUniversalIdentifier: indexViewUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    });

    for (const flatViewField of flatViewFields) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: flatViewField,
        universalFlatEntityMapsToMutate: allFlatEntityMaps.flatViewFieldMaps,
      });
    }
  }
};
