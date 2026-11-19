import { type StandaloneViewFieldManifest } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

type ByUniversalIdentifier<TFlatEntity> = {
  byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
};

export type MissingSuggestedViewField = {
  universalIdentifier: string;
  viewId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  position: number;
};

export const computeMissingSuggestedViewFields = ({
  suggestedViewFieldManifests,
  dismissedUniversalIdentifiers,
  workspaceCustomApplicationUniversalIdentifier,
  flatViewMaps,
  flatViewFieldMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  suggestedViewFieldManifests: Pick<
    StandaloneViewFieldManifest,
    | 'universalIdentifier'
    | 'viewUniversalIdentifier'
    | 'fieldMetadataUniversalIdentifier'
    | 'position'
  >[];
  dismissedUniversalIdentifiers: Set<string>;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatViewMaps: ByUniversalIdentifier<
    Pick<
      FlatView,
      | 'id'
      | 'key'
      | 'deletedAt'
      | 'objectMetadataUniversalIdentifier'
      | 'viewFieldUniversalIdentifiers'
    >
  >;
  flatViewFieldMaps: ByUniversalIdentifier<
    Pick<
      FlatViewField,
      'fieldMetadataUniversalIdentifier' | 'isCanonical' | 'deletedAt'
    >
  >;
  flatFieldMetadataMaps: ByUniversalIdentifier<
    Pick<
      FlatFieldMetadata,
      'id' | 'isActive' | 'objectMetadataUniversalIdentifier'
    >
  >;
  flatObjectMetadataMaps: ByUniversalIdentifier<Pick<FlatObjectMetadata, 'id'>>;
}): MissingSuggestedViewField[] => {
  const missingSuggestedViewFields: MissingSuggestedViewField[] = [];
  const proposedViewAndFieldKeys = new Set<string>();

  for (const suggestedViewFieldManifest of suggestedViewFieldManifests) {
    if (
      dismissedUniversalIdentifiers.has(
        suggestedViewFieldManifest.universalIdentifier,
      )
    ) {
      continue;
    }

    const declaredFlatView =
      flatViewMaps.byUniversalIdentifier[
        suggestedViewFieldManifest.viewUniversalIdentifier
      ];
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        suggestedViewFieldManifest.fieldMetadataUniversalIdentifier
      ];

    if (
      !isDefined(declaredFlatView) ||
      isDefined(declaredFlatView.deletedAt) ||
      !isDefined(flatFieldMetadata) ||
      !flatFieldMetadata.isActive ||
      flatFieldMetadata.objectMetadataUniversalIdentifier !==
        declaredFlatView.objectMetadataUniversalIdentifier
    ) {
      continue;
    }

    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        declaredFlatView.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    // Users land on the object's initial view, which hides the INDEX view.
    const initialFlatView =
      declaredFlatView.key === ViewKey.INDEX
        ? flatViewMaps.byUniversalIdentifier[
            getInitialObjectViewUniversalIdentifier({
              viewApplicationUniversalIdentifier:
                workspaceCustomApplicationUniversalIdentifier,
              objectUniversalIdentifier:
                declaredFlatView.objectMetadataUniversalIdentifier,
            })
          ]
        : undefined;

    const targetFlatView =
      isDefined(initialFlatView) && !isDefined(initialFlatView.deletedAt)
        ? initialFlatView
        : declaredFlatView;

    const isAlreadyDisplayed =
      targetFlatView.viewFieldUniversalIdentifiers.some(
        (viewFieldUniversalIdentifier) => {
          const flatViewField =
            flatViewFieldMaps.byUniversalIdentifier[
              viewFieldUniversalIdentifier
            ];

          return (
            isDefined(flatViewField) &&
            !isDefined(flatViewField.deletedAt) &&
            flatViewField.isCanonical &&
            flatViewField.fieldMetadataUniversalIdentifier ===
              suggestedViewFieldManifest.fieldMetadataUniversalIdentifier
          );
        },
      );

    const viewAndFieldKey = `${targetFlatView.id}:${flatFieldMetadata.id}`;

    if (isAlreadyDisplayed || proposedViewAndFieldKeys.has(viewAndFieldKey)) {
      continue;
    }

    proposedViewAndFieldKeys.add(viewAndFieldKey);

    missingSuggestedViewFields.push({
      universalIdentifier: suggestedViewFieldManifest.universalIdentifier,
      viewId: targetFlatView.id,
      objectMetadataId: flatObjectMetadata.id,
      fieldMetadataId: flatFieldMetadata.id,
      position: suggestedViewFieldManifest.position,
    });
  }

  return missingSuggestedViewFields;
};
