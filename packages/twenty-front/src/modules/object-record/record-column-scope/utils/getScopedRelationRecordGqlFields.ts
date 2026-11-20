import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
          // Only a limit can leave matching records out of the loaded ones
          shouldIncludeTotalCount: isDefined(first),
          recordGqlFields: buildIdentifierGqlFields(relationObjectMetadataItem),
        },
      ],
    ),
  );
