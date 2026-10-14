import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { mergeRecordGqlFields } from '@/object-record/graphql/record-gql-fields/utils/mergeRecordGqlFields';
import { type ResolvedRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { type RecordGqlFields } from 'twenty-shared/types';

// Selects, under each traversed relation, the related record's identifiers plus
// every target field shown through that relation.
export const generateTraversedRecordGqlFields = (
  relationTraversals: ResolvedRecordFieldRelationTraversal[],
): RecordGqlFields =>
  relationTraversals.reduce<RecordGqlFields>(
    (recordGqlFields, relationTraversal) =>
      mergeRecordGqlFields(recordGqlFields, {
        [`${relationTraversal.relationFieldMetadataItem.name}Id`]: true,
        [relationTraversal.relationFieldMetadataItem.name]: {
          ...buildIdentifierGqlFields(
            relationTraversal.targetObjectMetadataItem,
          ),
          [relationTraversal.targetFieldMetadataItem.name]: true,
        },
      }),
    {},
  );
