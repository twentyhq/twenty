import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';

export const getScopedRelationRecordGqlFields = (
  scopedRelationAliases: ScopedRelationAlias[],
): RecordGqlFields =>
  Object.fromEntries(
    scopedRelationAliases.map(
      ({
        responseKey,
        relationFieldName,
        relationObjectMetadataItem,
        filter,
        orderBy,
        first,
      }) => [
        responseKey,
        {
          relationFieldName,
          filter,
          orderBy,
          first,
          recordGqlFields: buildIdentifierGqlFields(relationObjectMetadataItem),
        },
      ],
    ),
  );
