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

// The type of the column an orderBy leaf sorts on, which for composite and
// relation leaves is the resolved sub/target column rather than the field the
// leaf hangs off. Callers that only need the comparison semantics of the
// ordering (e.g. the cursor keyset conditions) read it without resolving an
// alias they have no use for.
export const computeOrderByLeafColumnType = (
  leaf: OrderByLeaf,
): FieldMetadataType | null => {
  switch (leaf.kind) {
    case 'relation':
      return isDefined(leaf.targetFieldMetadata)
        ? (leaf.targetCompositeProperty ?? leaf.targetFieldMetadata).type
        : null;
    case 'composite':
      return leaf.compositeProperty.type;
    case 'scalar':
      return leaf.fieldMetadata.type;
  }
};

// The one mapping from an orderBy leaf to the column its values live in. The
// SQL ORDER BY expression, the hidden column selection and the raw-row alias
// the cursor side channel reads back (`"<tableAlias>_<columnName>"`) all
// derive from it, so they cannot drift apart.
export const computeOrderByLeafColumn = (
  leaf: OrderByLeaf,
  objectNameSingular: string,
): OrderByLeafColumn | null => {
  const columnType = computeOrderByLeafColumnType(leaf);

  if (!isDefined(columnType)) {
    // A relation without a resolvable target contributes no ordering
    return null;
  }

  switch (leaf.kind) {
    case 'relation':
      return {
        tableAlias: leaf.path[0],
        columnName: isDefined(leaf.targetCompositeProperty)
          ? computeCompositeColumnName(
              leaf.path[1],
              leaf.targetCompositeProperty,
            )
          : leaf.path[1],
        columnType,
      };
    case 'composite':
      return {
        tableAlias: objectNameSingular,
        columnName: computeCompositeColumnName(
          leaf.path[0],
          leaf.compositeProperty,
        ),
        columnType,
      };
    case 'scalar':
      return {
        tableAlias: objectNameSingular,
        columnName: leaf.path[0],
        columnType,
      };
  }
};
