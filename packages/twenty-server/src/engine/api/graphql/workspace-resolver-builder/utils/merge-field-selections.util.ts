import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-field-selections.util';

// Aliases of a field whose data is not per alias (composites, edges, node) read the same values
export const mergeFieldSelections = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: ResolverSelectedFields;
  fieldName: string;
}): ResolverSelectedFields =>
  Object.assign(
    Object.create(null),
    ...getFieldSelections({ selectedFields, fieldName }).map(
      ({ selection }) => selection,
    ),
  );
