import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export type SeedOperations = {
  viewsToCreate: UniversalFlatView[];
  viewFieldsToCreate: UniversalFlatViewField[];
};

export type SeedOperationsByApplication = Map<string, SeedOperations>;

export const computeSeedObjectDefaultViewOperationsByApplication = ({
    flatObjectMetadataMaps,
    flatViewMaps,
    flatViewFieldMaps,
    seededViewApplicationUniversalIdentifier,
  }: Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatViewMaps' | 'flatViewFieldMaps'
  > & {
    seededViewApplicationUniversalIdentifier: string;
  }): SeedOperationsByApplication => {
    const seedOperationsByApplication: SeedOperationsByApplication = new Map();

    const getApplicationBucket = (applicationUniversalIdentifier: string) => {
      const existingBucket = seedOperationsByApplication.get(
        applicationUniversalIdentifier,
      );

      if (isDefined(existingBucket)) {
        return existingBucket;
      }

      const newBucket: SeedOperations = {
        viewsToCreate: [],
        viewFieldsToCreate: [],
      };

      seedOperationsByApplication.set(
        applicationUniversalIdentifier,
        newBucket,
      );

      return newBucket;
    };

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

      const applicationBucket = getApplicationBucket(
        seededViewApplicationUniversalIdentifier,
      );

      if (!isDefined(existingSeededFlatView)) {
        applicationBucket.viewsToCreate.push(
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

        applicationBucket.viewFieldsToCreate.push({
          ...flatViewField,
          viewUniversalIdentifier: seededViewUniversalIdentifier,
          viewFieldGroupUniversalIdentifier: null,
          universalOverrides: null,
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          universalIdentifier: seededViewFieldUniversalIdentifier,
          isSystemSideEffect: false,
        });
      }
    }

    return seedOperationsByApplication;
};
