import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { type AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { transformFlatEntityForComparison } from 'src/engine/core-modules/common/utils/transform-flat-entity-for-comparison.util';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export const compareTwoFlatEntity = <
  TFlatEntity extends AllFlatEntities,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends keyof TFlatEntity,
>({
  fromFlatEntity,
  toFlatEntity,
  propertiesToCompare,
  propertiesToStringify,
}: {
  propertiesToCompare: PToCompare[];
  propertiesToStringify: PJsonB[];
} & FromTo<TFlatEntity, 'flatEntity'>) => {
  const [transformedFromFlatEntity, transformedToFlatEntity] = [
    fromFlatEntity,
    toFlatEntity,
  ].map((flatEntity) =>
    transformFlatEntityForComparison({
      flatEntity,
      options: {
        propertiesToCompare,
        propertiesToStringify,
      },
    }),
  );

  const flatEntityDifferences = diff(
    transformedFromFlatEntity,
    transformedToFlatEntity,
  );

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
        const isJsonb = propertiesToStringify.includes(
          property as unknown as PJsonB,
        );

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
