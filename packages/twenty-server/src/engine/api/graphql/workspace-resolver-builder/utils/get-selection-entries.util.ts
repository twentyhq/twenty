import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { SELECTION_FIELD_NAME } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-field-name.constant';
import { SELECTION_RESPONSE_KEY } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-response-key.constant';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';

export const getSelectionEntries = (
  selectedFields: ResolverSelectedFields,
): {
  responseKey: string;
  fieldName: string;
  selection: ResolverSelectedFields;
}[] =>
  Object.entries(selectedFields)
    .filter(([, selection]) => isDefined(selection))
    .map(([key, selection]) => {
      const selectionObject: ResolverSelectedFields | undefined = isPlainObject(
        selection,
      )
        ? selection
        : undefined;
      const responseKey = selectionObject?.[SELECTION_RESPONSE_KEY] ?? key;

      return {
        responseKey,
        fieldName: selectionObject?.[SELECTION_FIELD_NAME] ?? responseKey,
        selection,
      };
    });
