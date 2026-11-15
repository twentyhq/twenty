import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { doNotTranslate } from 'twenty-shared/i18n';
import { capitalize } from 'twenty-shared/utils';

// Arguments go in as variables because some filter values are enums, which inline JSON cannot express
export const getRelationsWithArgumentsVariableDefinitions = (
  readableRelationsWithArguments: ReadableRelationWithArguments[],
) =>
  readableRelationsWithArguments
    .map(({ responseKey, relationObjectMetadataItem }) => {
      const typeName = capitalize(relationObjectMetadataItem.nameSingular);

      return doNotTranslate(
        `, $${responseKey}Filter: ${typeName}FilterInput, $${responseKey}OrderBy: [${typeName}OrderByInput], $${responseKey}First: Int`,
      );
    })
    .join('');
