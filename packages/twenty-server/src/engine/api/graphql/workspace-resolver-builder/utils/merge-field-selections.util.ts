import { isPlainObject } from 'twenty-shared/utils';

import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-field-selections.util';

const mergeSelections = (
  selections: ResolverSelectedFields[],
): ResolverSelectedFields =>
  selections.reduce<ResolverSelectedFields>((merged, selection) => {
    for (const [key, value] of Object.entries(selection)) {
      const existingValue = merged[key];

      merged[key] =
        isPlainObject(existingValue) && isPlainObject(value)
          ? mergeSelections([existingValue, value])
          : value;
    }

    return merged;
  }, Object.create(null));

// Aliases of a field whose data is not per alias (composites, edges, node) read the same values
export const mergeFieldSelections = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: ResolverSelectedFields;
  fieldName: string;
}): ResolverSelectedFields =>
  mergeSelections(
    getFieldSelections({ selectedFields, fieldName }).map(
      ({ selection }) => selection,
    ),
  );
