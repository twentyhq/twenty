import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';

export const generateFindRecordsOutputSchema = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): FindRecordsOutputSchema => {
  const recordOutputSchema = generateRecordOutputSchema(objectMetadataItem);

  return {
    first: {
      isLeaf: false,
      icon: 'IconAlpha',
      label: `First ${objectMetadataItem.labelSingular ?? 'Record'}`,
      value: recordOutputSchema,
    },
    all: {
      isLeaf: true,
      icon: 'IconListDetails',
      label: `All ${objectMetadataItem.labelPlural ?? 'Records'}`,
      type: 'array',
      value: 'Returns an array of records',
    },
    totalCount: {
      isLeaf: true,
      icon: 'IconSum',
      label: 'Total Count',
      type: 'number',
      value: 'Count of matching records',
    },
  };
};
