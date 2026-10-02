import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { buildValidationRulePreviewRelationGqlFields } from '@/validation-rules/utils/buildValidationRulePreviewRelationGqlFields';

const PREVIEW_RECORD_COUNT = 3;

export const useValidationRulePreviewRecords = ({
  objectMetadataItem,
  fields,
  expression,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  expression: string;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const compilationResult = compileValidationRuleExpression({
    expression,
    fields,
  });

  const { records, loading } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: PREVIEW_RECORD_COUNT,
    orderBy: [{ createdAt: 'DescNullsLast' }],
    recordGqlFields: {
      ...generateDepthRecordGqlFieldsFromObject({
        objectMetadataItems,
        objectMetadataItem,
        depth: 0,
      }),
      ...buildValidationRulePreviewRelationGqlFields({
        bindingPaths: compilationResult.isValid
          ? Object.keys(compilationResult.bindings)
          : [],
        fields,
      }),
    },
  });

  return { records, loading, compilationResult };
};
