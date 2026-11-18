import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type ByUniversalIdentifier<TFlatEntity> = {
  byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
};

export const buildMissingApplicationInitialViewFields = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFieldMaps,
  twentyStandardApplicationUniversalIdentifier,
  now,
}: {
  flatObjectMetadataMaps: ByUniversalIdentifier<
    Pick<FlatObjectMetadata, 'universalIdentifier' | 'viewUniversalIdentifiers'>
  >;
  flatFieldMetadataMaps: ByUniversalIdentifier<
    Pick<FlatFieldMetadata, 'applicationUniversalIdentifier'>
  >;
  flatViewMaps: ByUniversalIdentifier<
    Pick<
      FlatView,
      | 'universalIdentifier'
      | 'applicationUniversalIdentifier'
      | 'key'
      | 'deletedAt'
      | 'viewFieldUniversalIdentifiers'
    >
  >;
  flatViewFieldMaps: ByUniversalIdentifier<
    Pick<
      FlatViewField,
      | 'applicationUniversalIdentifier'
      | 'universalOverrides'
      | 'fieldMetadataUniversalIdentifier'
      | 'position'
      | 'isSystemSideEffect'
      | 'isCanonical'
      | 'deletedAt'
    >
  >;
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
        .filter(isDefined)
        .map((flatViewField) => ({
          flatViewField,
          // A user's column move is stored as an override, not in position.
          effectivePosition: resolveEffectiveUniversalFlatEntityProperty({
            metadataName: 'viewField',
            universalFlatEntity: flatViewField,
            property: 'position',
          }),
        }));

    const initialFlatViewFields = findFlatViewFields(
      initialFlatView.viewFieldUniversalIdentifiers,
    );

    // Soft-deleted view fields count: a column the user removed stays removed.
    const displayedFieldMetadataUniversalIdentifiers = new Set(
      initialFlatViewFields
        .filter(({ flatViewField }) => flatViewField.isCanonical)
        .map(
          ({ flatViewField }) => flatViewField.fieldMetadataUniversalIdentifier,
        ),
    );

    let nextPosition =
      initialFlatViewFields
        .filter(({ flatViewField }) => !isDefined(flatViewField.deletedAt))
        .reduce(
          (maxPosition, { effectivePosition }) =>
            Math.max(maxPosition, effectivePosition),
          -1,
        ) + 1;

    const indexFlatViewFields = findFlatViewFields(
      indexFlatView.viewFieldUniversalIdentifiers,
    )
      .filter(
        ({ flatViewField }) =>
          flatViewField.isSystemSideEffect &&
          flatViewField.isCanonical &&
          !isDefined(flatViewField.deletedAt),
      )
      .sort(
        (indexFlatViewFieldA, indexFlatViewFieldB) =>
          indexFlatViewFieldA.effectivePosition -
          indexFlatViewFieldB.effectivePosition,
      );

    for (const { flatViewField: indexFlatViewField } of indexFlatViewFields) {
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
