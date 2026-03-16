import { type ViewSort } from '~/generated-metadata/graphql';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areViewSortsEqual = (
  viewSortA: Pick<ViewSort, 'fieldMetadataId' | 'direction'>,
  viewSortB: Pick<ViewSort, 'fieldMetadataId' | 'direction'>,
) => {
  const propertiesToCompare: (keyof Pick<
    ViewSort,
    'fieldMetadataId' | 'direction'
  >)[] = ['fieldMetadataId', 'direction'];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewSortA[
        property as keyof Pick<ViewSort, 'fieldMetadataId' | 'direction'>
      ],
      viewSortB[
        property as keyof Pick<ViewSort, 'fieldMetadataId' | 'direction'>
      ],
    ),
  );
};
