import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildSeededViewFieldFlatEntity } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-seeded-view-field-flat-entity.util';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export type SeedOperations = {
  viewsToCreate: UniversalFlatView[];
  viewFieldsToCreate: UniversalFlatViewField[];
};

export const computeSeedObjectDefaultViewOperations = ({
  flatObjectMetadataMaps,
  flatViewMaps,
  flatViewFieldMaps,
  seededViewApplicationUniversalIdentifier,
}: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatViewMaps' | 'flatViewFieldMaps'
> & {
  seededViewApplicationUniversalIdentifier: string;
}): SeedOperations => {
  const seedOperations: SeedOperations = {
    viewsToCreate: [],
    viewFieldsToCreate: [],
  };

  const createdAt = new Date().toISOString();

  const flatIndexViewByObjectUniversalIdentifier = new Map<
    string,
    UniversalFlatView
  >();

  for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
    if (
      isDefined(flatView) &&
      flatView.key === ViewKey.INDEX &&
      flatView.deletedAt === null
    ) {
      flatIndexViewByObjectUniversalIdentifier.set(
        flatView.objectMetadataUniversalIdentifier,
        flatView,
      );
    }
  }

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
      continue;
    }

    const flatIndexView = flatIndexViewByObjectUniversalIdentifier.get(
      flatObjectMetadata.universalIdentifier,
    );

    if (!isDefined(flatIndexView)) {
      continue;
    }

    const seededViewUniversalIdentifier =
      getSeededObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          seededViewApplicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      });

    const existingSeededFlatView =
      flatViewMaps.byUniversalIdentifier[seededViewUniversalIdentifier];

    const existingSeededViewFieldUniversalIdentifiers = new Set(
      existingSeededFlatView?.viewFieldUniversalIdentifiers ?? [],
    );

    if (!isDefined(existingSeededFlatView)) {
      seedOperations.viewsToCreate.push(
        computeSeededObjectViewToCreate({
          objectMetadata: flatObjectMetadata,
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
        }),
      );
    }

    for (const viewFieldUniversalIdentifier of flatIndexView.viewFieldUniversalIdentifiers) {
      const flatViewField =
        flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

      if (!isDefined(flatViewField)) {
        continue;
      }

      const seededViewFieldUniversalIdentifier =
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          viewUniversalIdentifier: seededViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        });

      if (
        existingSeededViewFieldUniversalIdentifiers.has(
          seededViewFieldUniversalIdentifier,
        )
      ) {
        continue;
      }

      seedOperations.viewFieldsToCreate.push(
        buildSeededViewFieldFlatEntity({
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          seededViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
          isVisible: flatViewField.isVisible,
          size: flatViewField.size,
          position: flatViewField.position,
          aggregateOperation: flatViewField.aggregateOperation,
          isActive: flatViewField.isActive,
          createdAt,
        }),
      );
    }
  }

  return seedOperations;
};
