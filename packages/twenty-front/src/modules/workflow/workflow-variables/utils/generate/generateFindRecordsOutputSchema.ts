import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { t } from '@lingui/core/macro';

export const generateFindRecordsOutputSchema = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): FindRecordsOutputSchema => {
  const recordOutputSchema = generateRecordOutputSchema(objectMetadataItem);
  const objectLabelSingular = objectMetadataItem.labelSingular ?? t`Record`;
  const objectLabelPlural = objectMetadataItem.labelPlural ?? t`Records`;

  return {
    first: {
      isLeaf: false,
      icon: 'IconAlpha',
      label: t`First ${objectLabelSingular}`,
      value: recordOutputSchema,
    },
    all: {
      isLeaf: true,
      icon: 'IconListDetails',
      label: t`All ${objectLabelPlural}`,
      type: 'array',
      value: t`Returns an array of records`,
    },
    totalCount: {
      isLeaf: true,
      icon: 'IconSum',
      label: t`Total Count`,
      type: 'number',
      value: t`Count of matching records`,
    },
  };
};
