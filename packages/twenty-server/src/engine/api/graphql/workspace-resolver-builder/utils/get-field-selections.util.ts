import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';

export const isSelectionMetaKey = (key: string) =>
  key === '__fieldName' || key === '__arguments';

export const getSelectedFieldName = (
  responseKey: string,
  selection: unknown,
): string =>
  typeof selection === 'object' &&
  selection !== null &&
  '__fieldName' in selection &&
  typeof selection.__fieldName === 'string'
    ? selection.__fieldName
    : responseKey;

export const getFieldSelections = (
  selectedFields: ResolverSelectedFields,
  fieldName: string,
): { responseKey: string; selection: ResolverSelectedFields }[] =>
  Object.entries(selectedFields)
    .filter(
      ([responseKey, selection]) =>
        selection !== undefined &&
        selection !== null &&
        !isSelectionMetaKey(responseKey) &&
        getSelectedFieldName(responseKey, selection) === fieldName,
    )
    .map(([responseKey, selection]) => ({ responseKey, selection }));
