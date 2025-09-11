import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_VIEW_PROPERTIES_TO_COMPARE } from 'src/engine/core-modules/view/flat-view/constants/flat-view-properies-to-compare.constant';
import { type FlatViewPropertiesToCompare } from 'src/engine/core-modules/view/flat-view/types/flat-view-properties-to-compare.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { type UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateViewActionArgs = FromTo<FlatView, 'FlatView'>;

export const compareTwoFlatView = ({
  fromFlatView,
  toFlatView,
}: GetWorkspaceMigrationUpdateViewActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_VIEW_PROPERTIES_TO_COMPARE.includes(
        property as FlatViewPropertiesToCompare,
      ),
    propertiesToStringify: [],
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatView,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatView,
    transformMetadataForComparisonParameters,
  );

  const flatViewDifferences = diff(fromCompare, toCompare);

  return flatViewDifferences.flatMap<UpdateViewAction['updates'][number]>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;
          const property = path[0] as FlatViewPropertiesToCompare;

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
    },
  );
};
