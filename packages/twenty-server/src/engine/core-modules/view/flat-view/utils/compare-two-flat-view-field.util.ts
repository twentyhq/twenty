import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE } from 'src/engine/core-modules/view/flat-view/constants/flat-view-field-properties-to-compare.constant';
import { type FlatViewFieldPropertiesToCompare } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-properties-to-compare.type';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type UpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateViewFieldActionArgs = FromTo<
  FlatViewField,
  'FlatViewField'
>;

export const compareTwoFlatViewField = ({
  fromFlatViewField,
  toFlatViewField,
}: GetWorkspaceMigrationUpdateViewFieldActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE.includes(
        property as FlatViewFieldPropertiesToCompare,
      ),
    propertiesToStringify: [],
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatViewField,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatViewField,
    transformMetadataForComparisonParameters,
  );

  const flatViewFieldDifferences = diff(fromCompare, toCompare);

  return flatViewFieldDifferences.flatMap<
    UpdateViewFieldAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatViewFieldPropertiesToCompare;

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
