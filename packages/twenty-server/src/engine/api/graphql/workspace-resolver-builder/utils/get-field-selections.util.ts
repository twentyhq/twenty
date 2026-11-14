import { isDefined } from 'twenty-shared/utils';

import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getSelectedFieldName } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-selected-field-name.util';
import { isSelectionMetaKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/is-selection-meta-key.util';

export const getFieldSelections = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: ResolverSelectedFields;
  fieldName: string;
}): { responseKey: string; selection: ResolverSelectedFields }[] =>
  Object.entries(selectedFields)
    .filter(
      ([responseKey, selection]) =>
        isDefined(selection) &&
        !isSelectionMetaKey(responseKey) &&
        getSelectedFieldName({ responseKey, selection }) === fieldName,
    )
    .map(([responseKey, selection]) => ({ responseKey, selection }));
