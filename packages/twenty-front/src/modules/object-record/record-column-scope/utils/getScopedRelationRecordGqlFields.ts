import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';

export const getScopedRelationRecordGqlFields = (
  scopedRelationAliases: ScopedRelationAlias[],
): RecordGqlFields =>
  Object.fromEntries(
    scopedRelationAliases.map(
      ({
        alias,
        fieldName,
        relationObjectMetadataItem,
        filter,
        orderBy,
        first,
      }) => [
        alias,
        {
          relationFieldName: fieldName,
          filter,
          orderBy,
          first,
          recordGqlFields: buildIdentifierGqlFields(relationObjectMetadataItem),
        },
      ],
    ),
  );
