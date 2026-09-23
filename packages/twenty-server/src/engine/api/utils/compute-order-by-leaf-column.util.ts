import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export type OrderByLeafColumn = {
  tableAlias: string;
  columnName: string;
  columnType: FieldMetadataType;
};

// ORDER BY, hidden column selection and the cursor raw-row alias all derive from this so they cannot drift apart
export const computeOrderByLeafColumn = (
  leaf: OrderByLeaf,
  objectNameSingular: string,
): OrderByLeafColumn | null => {
  switch (leaf.kind) {
    case 'relation': {
      if (!isDefined(leaf.targetFieldMetadata)) {
        return null;
      }

      return {
        tableAlias: leaf.path[0],
        columnName: isDefined(leaf.targetCompositeProperty)
          ? computeCompositeColumnName(
              leaf.path[1]!,
              leaf.targetCompositeProperty,
            )
          : leaf.path[1],
        columnType: (leaf.targetCompositeProperty ?? leaf.targetFieldMetadata)
          .type,
      };
    }
    case 'composite':
      return {
        tableAlias: objectNameSingular,
        columnName: computeCompositeColumnName(
          leaf.path[0]!,
          leaf.compositeProperty,
        ),
        columnType: leaf.compositeProperty.type,
      };
    case 'scalar':
      return {
        tableAlias: objectNameSingular,
        columnName: leaf.path[0],
        columnType: leaf.fieldMetadata.type,
      };
  }
};
