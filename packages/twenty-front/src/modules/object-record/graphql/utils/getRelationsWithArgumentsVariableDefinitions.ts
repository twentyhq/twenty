import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { getRelationWithArgumentsVariableNames } from '@/object-record/graphql/utils/getRelationWithArgumentsVariableNames';
import { doNotTranslate } from 'twenty-shared/i18n';
import { capitalize } from 'twenty-shared/utils';

// Arguments go in as variables because some filter values are enums, which inline JSON cannot express
export const getRelationsWithArgumentsVariableDefinitions = (
  readableRelationsWithArguments: ReadableRelationWithArguments[],
) =>
  readableRelationsWithArguments
    .map(({ responseKey, relationObjectMetadataItem }) => {
      const typeName = capitalize(relationObjectMetadataItem.nameSingular);
      const variableNames = getRelationWithArgumentsVariableNames(responseKey);

      return doNotTranslate(
        `, $${variableNames.filter}: ${typeName}FilterInput, $${variableNames.orderBy}: [${typeName}OrderByInput], $${variableNames.first}: Int`,
      );
    })
    .join('');
