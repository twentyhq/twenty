import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';
import {
  isDefined,
  isRecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/utils';

const getRelatedRecordGqlFields = ({
  scopedRelationAlias: { relationObjectMetadataItem, scopedRelationJunction },
  objectMetadataItems,
}: {
  scopedRelationAlias: Pick<
    ScopedRelationAlias,
    'relationObjectMetadataItem' | 'scopedRelationJunction'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordGqlFields => {
  if (!isDefined(scopedRelationJunction)) {
    return buildIdentifierGqlFields(relationObjectMetadataItem);
  }

  return generateJunctionRelationGqlFields({
    junctionConfig: scopedRelationJunction.junctionConfig,
    objectMetadataItems,
  });
};

export const getScopedRelationRecordGqlFields = ({
  scopedRelationAliases,
  objectMetadataItems,
}: {
  scopedRelationAliases: ScopedRelationAlias[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordGqlFields =>
  scopedRelationAliases.reduce<RecordGqlFields>(
    (scopedRelationRecordGqlFields, scopedRelationAlias) => {
      const {
        responseKey,
        relationFieldName,
        filter,
        orderBy,
        first,
        lookupTarget,
      } = scopedRelationAlias;
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
            ...getRelatedRecordGqlFields({
              scopedRelationAlias,
              objectMetadataItems,
            }),
            ...(isDefined(lookupTarget) && {
              [lookupTarget.lookupTargetFieldMetadataItem.name]: true,
            }),
          },
        },
      };
    },
    {},
  );
