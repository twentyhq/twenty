import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getSelectionEntries } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-selection-entries.util';

export const getFieldSelections = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: ResolverSelectedFields;
  fieldName: string;
}) =>
  getSelectionEntries(selectedFields).filter(
    (selectionEntry) => selectionEntry.fieldName === fieldName,
  );
