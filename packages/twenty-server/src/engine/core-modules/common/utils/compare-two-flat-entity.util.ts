import diff from 'microdiff';
import { AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

export const compareTwoFlatEntity = <
  TFlatEntity extends AllFlatEntities,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends keyof TFlatEntity,
>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  jsonbProperties,
}: {
  propertiesToCompare: PToCompare[];
  jsonbProperties: PJsonB[];
} & FromTo<TFlatEntity, 'flatEntity'>) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !propertiesToCompare.includes(property as PToCompare),
    propertiesToStringify: jsonbProperties,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatEntity,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatEntity,
    transformMetadataForComparisonParameters,
  );

  const flatEntityDifferences = diff(fromCompare, toCompare);

  return flatEntityDifferences.flatMap<
    Array<
      {
        [P in PToCompare]: PropertyUpdate<TFlatEntity, P>;
      }[PToCompare]
    >[number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as PToCompare;
        const isJsonb = jsonbProperties.includes(property as unknown as PJsonB);

        if (isJsonb) {
          return {
            from: parseJson(oldValue),
            to: parseJson(value),
            property,
          };
        }

        return {
          from: oldValue,
          to: value,
          property,
        };
      }
      case 'CREATE':
      case 'REMOVE':
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });
};
