import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export type OrderByLeafColumn = {
  // The SQL alias the column lives on: the root object for scalar and
  // composite leaves, the relation's join alias for relation leaves
  tableAlias: string;
  columnName: string;
  columnType: FieldMetadataType;
};

// The one mapping from an orderBy leaf to the column its values live in. The
// SQL ORDER BY expression, the hidden column selection and the raw-row alias
// the cursor side channel reads back (`"<tableAlias>_<columnName>"`) all
// derive from it, so they cannot drift apart.
export const computeOrderByLeafColumn = (
  leaf: OrderByLeaf,
  objectNameSingular: string,
): OrderByLeafColumn | null => {
  switch (leaf.kind) {
    case 'relation': {
      if (!isDefined(leaf.targetFieldMetadata)) {
        // A relation without a resolvable target contributes no ordering
        return null;
      }

      return {
        tableAlias: leaf.path[0],
        columnName: isDefined(leaf.targetCompositeProperty)
          ? computeCompositeColumnName(
              leaf.path[1],
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
          leaf.path[0],
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
