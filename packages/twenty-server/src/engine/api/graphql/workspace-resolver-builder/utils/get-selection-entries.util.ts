import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';

export const getSelectionEntries = (
  selectedFields: ResolverSelectedFields,
): {
  responseKey: string;
  fieldName: string;
  selection: ResolverSelectedFields;
}[] =>
  Object.entries(selectedFields)
    .filter(
      ([responseKey, selection]) =>
        isDefined(selection) &&
        responseKey !== '__fieldName' &&
        responseKey !== '__arguments',
    )
    .map(([responseKey, selection]) => ({
      responseKey,
      fieldName:
        isPlainObject(selection) && isString(selection.__fieldName)
          ? selection.__fieldName
          : responseKey,
      selection,
    }));
