import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';
import {
  isDefined,
  isRecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/utils';

export const getScopedRelationRecordGqlFields = (
  scopedRelationAliases: ScopedRelationAlias[],
): RecordGqlFields =>
  scopedRelationAliases.reduce<RecordGqlFields>(
    (
      scopedRelationRecordGqlFields,
      {
        responseKey,
        relationFieldName,
        relationObjectMetadataItem,
        filter,
        orderBy,
        first,
        lookupTarget,
      },
    ) => {
      const sameScopeRelation = scopedRelationRecordGqlFields[responseKey];

      return {
        ...scopedRelationRecordGqlFields,
        [responseKey]: {
          relationFieldName,
          filter,
          orderBy,
          first,
          recordGqlFields: {
            // Columns with the same scope share a response key, so its entry selects the fields of all of them
            ...(isRecordGqlFieldsRelationWithArguments(sameScopeRelation) &&
              sameScopeRelation.recordGqlFields),
            ...buildIdentifierGqlFields(relationObjectMetadataItem),
            ...(isDefined(lookupTarget) && {
              [lookupTarget.lookupTargetFieldMetadataItem.name]: true,
            }),
          },
        },
      };
    },
    {},
  );
