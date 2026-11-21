import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFields } from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
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
        summary,
      } = scopedRelationAlias;
      const sameScopeRelation = scopedRelationRecordGqlFields[responseKey];
      const sameScopeRelationWithArguments =
        isRecordGqlFieldsRelationWithArguments(sameScopeRelation)
          ? sameScopeRelation
          : undefined;

      const aggregateGqlFieldNames = [
        ...new Set([
          ...(sameScopeRelationWithArguments?.aggregateGqlFieldNames ?? []),
          // Selecting an aggregate of a field the user cannot read would fail the whole query
          ...(isDefined(summary) && summary.isAggregatedFieldReadable
            ? [summary.aggregateGqlFieldName]
            : []),
        ]),
      ];

      return {
        ...scopedRelationRecordGqlFields,
        [responseKey]: {
          relationFieldName,
          filter,
          orderBy,
          first,
          ...(isNonEmptyArray(aggregateGqlFieldNames) && {
            aggregateGqlFieldNames,
          }),
          recordGqlFields: {
            // Columns with the same scope share a response key, so its entry selects the fields of all of them
            ...sameScopeRelationWithArguments?.recordGqlFields,
            // A summary reads its aggregate alone, so its related records are fetched by id only
            ...(isDefined(summary)
              ? { id: true }
              : getRelatedRecordGqlFields({
                  scopedRelationAlias,
                  objectMetadataItems,
                })),
            ...(isDefined(lookupTarget) && {
              [lookupTarget.lookupTargetFieldMetadataItem.name]: true,
            }),
          },
        },
      };
    },
    {},
  );
