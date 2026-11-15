import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

// Arguments go in as variables because some filter values are enums, which inline JSON cannot express
export const mapRecordGqlRelationAliasesToGraphQLQuery = ({
  relationAliases = [],
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  relationAliases?: RecordGqlRelationAlias[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
}) => ({
  variableDefinitions: relationAliases
    .map(({ alias, relationObjectMetadataItem }) => {
      const typeName = capitalize(relationObjectMetadataItem.nameSingular);

      return doNotTranslate(
        `, $${alias}Filter: ${typeName}FilterInput, $${alias}OrderBy: [${typeName}OrderByInput], $${alias}First: Int`,
      );
    })
    .join(''),
  selections: relationAliases.map(
    ({ alias, fieldName, relationObjectMetadataItem }) =>
      doNotTranslate(`${alias}: ${fieldName}(filter: $${alias}Filter, orderBy: $${alias}OrderBy, first: $${alias}First) {
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationObjectMetadataItem,
      recordGqlFields: buildIdentifierGqlFields(relationObjectMetadataItem),
      isRootLevel: false,
      objectPermissionsByObjectMetadataId,
    })}
  }
}`),
  ),
});
