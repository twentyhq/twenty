import { type CoreViewSort } from '~/generated/graphql';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areViewSortsEqual = (
  viewSortA: Pick<CoreViewSort, 'fieldMetadataId' | 'direction'>,
  viewSortB: Pick<CoreViewSort, 'fieldMetadataId' | 'direction'>,
) => {
  const propertiesToCompare: (keyof Pick<
    CoreViewSort,
    'fieldMetadataId' | 'direction'
  >)[] = ['fieldMetadataId', 'direction'];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewSortA[
        property as keyof Pick<CoreViewSort, 'fieldMetadataId' | 'direction'>
      ],
      viewSortB[
        property as keyof Pick<CoreViewSort, 'fieldMetadataId' | 'direction'>
      ],
    ),
  );
};
