import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// Mirrors onto each object initial view the INDEX columns of fields contributed
// by an installed application, which predate fieldInitialObjectViewFieldOnCreate.
export const buildMissingApplicationInitialViewFields = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFieldMaps,
  twentyStandardApplicationUniversalIdentifier,
  now,
}: Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
> & {
  twentyStandardApplicationUniversalIdentifier: string;
  now: string;
}): Map<string, UniversalFlatViewField[]> => {
  const flatViewFieldsToCreateByApplicationUniversalIdentifier = new Map<
    string,
    UniversalFlatViewField[]
  >();

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const liveFlatViews = flatObjectMetadata.viewUniversalIdentifiers
      .map(
        (viewUniversalIdentifier) =>
          flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
      )
      .filter(isDefined)
      .filter((flatView) => !isDefined(flatView.deletedAt));

    const indexFlatView = liveFlatViews.find(
      (flatView) => flatView.key === ViewKey.INDEX,
    );
    const initialFlatView = liveFlatViews.find(
      (flatView) =>
        flatView.universalIdentifier ===
        getInitialObjectViewUniversalIdentifier({
          viewApplicationUniversalIdentifier:
            flatView.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        }),
    );

    if (!isDefined(indexFlatView) || !isDefined(initialFlatView)) {
      continue;
    }

    const findFlatViewFields = (viewFieldUniversalIdentifiers: string[]) =>
      viewFieldUniversalIdentifiers
        .map(
          (viewFieldUniversalIdentifier) =>
            flatViewFieldMaps.byUniversalIdentifier[
              viewFieldUniversalIdentifier
            ],
        )
        .filter(isDefined);

    const initialFlatViewFields = findFlatViewFields(
      initialFlatView.viewFieldUniversalIdentifiers,
    );

    // Soft-deleted view fields count: a column the user removed stays removed.
    const displayedFieldMetadataUniversalIdentifiers = new Set(
      initialFlatViewFields
        .filter((flatViewField) => flatViewField.isCanonical)
        .map((flatViewField) => flatViewField.fieldMetadataUniversalIdentifier),
    );

    let nextPosition =
      initialFlatViewFields
        .filter((flatViewField) => !isDefined(flatViewField.deletedAt))
        .reduce(
          (maxPosition, flatViewField) =>
            Math.max(maxPosition, flatViewField.position),
          -1,
        ) + 1;

    const indexFlatViewFields = findFlatViewFields(
      indexFlatView.viewFieldUniversalIdentifiers,
    )
      .filter(
        (flatViewField) =>
          flatViewField.isSystemSideEffect &&
          flatViewField.isCanonical &&
          !isDefined(flatViewField.deletedAt),
      )
      .sort(
        (flatViewFieldA, flatViewFieldB) =>
          flatViewFieldA.position - flatViewFieldB.position,
      );

    for (const indexFlatViewField of indexFlatViewFields) {
      const { fieldMetadataUniversalIdentifier } = indexFlatViewField;

      const flatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          fieldMetadataUniversalIdentifier
        ];

      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.applicationUniversalIdentifier ===
          twentyStandardApplicationUniversalIdentifier ||
        flatFieldMetadata.applicationUniversalIdentifier ===
          initialFlatView.applicationUniversalIdentifier ||
        displayedFieldMetadataUniversalIdentifiers.has(
          fieldMetadataUniversalIdentifier,
        )
      ) {
        continue;
      }

      const { applicationUniversalIdentifier } = flatFieldMetadata;

      const universalIdentifier = getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        viewUniversalIdentifier: initialFlatView.universalIdentifier,
        fieldMetadataUniversalIdentifier,
      });

      if (
        isDefined(flatViewFieldMaps.byUniversalIdentifier[universalIdentifier])
      ) {
        continue;
      }

      const flatViewFieldsToCreate =
        flatViewFieldsToCreateByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? [];

      flatViewFieldsToCreate.push({
        universalIdentifier,
        applicationUniversalIdentifier,
        fieldMetadataUniversalIdentifier,
        viewUniversalIdentifier: initialFlatView.universalIdentifier,
        viewFieldGroupUniversalIdentifier: null,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        position: nextPosition,
        aggregateOperation: null,
        relationTargetFieldMetadataUniversalIdentifier: null,
        isActive: true,
        isSystemSideEffect: true,
        isCanonical: true,
        universalOverrides: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      flatViewFieldsToCreateByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        flatViewFieldsToCreate,
      );

      nextPosition += 1;
    }
  }

  return flatViewFieldsToCreateByApplicationUniversalIdentifier;
};
