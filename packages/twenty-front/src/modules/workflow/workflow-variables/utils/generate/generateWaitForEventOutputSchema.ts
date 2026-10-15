import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WaitForEventOutputSchema } from '@/workflow/workflow-variables/types/WaitForEventOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { t } from '@lingui/core/macro';
import { DatabaseEventAction } from '~/generated-metadata/graphql';

export const generateWaitForEventOutputSchema = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  action: DatabaseEventAction,
): WaitForEventOutputSchema => {
  const outputSchema: WaitForEventOutputSchema = {
    record: {
      isLeaf: false,
      icon: objectMetadataItem.icon ?? undefined,
      label: objectMetadataItem.labelSingular,
      value: generateRecordOutputSchema(objectMetadataItem),
    },
    recordId: {
      isLeaf: true,
      icon: 'IconId',
      type: 'string',
      label: t`Record ID`,
      value: '',
    },
    hasTimedOut: {
      isLeaf: true,
      icon: 'IconClockX',
      type: 'boolean',
      label: t`Has Timed Out`,
      value: false,
    },
  };

  if (
    action !== DatabaseEventAction.UPDATED &&
    action !== DatabaseEventAction.UPSERTED
  ) {
    return outputSchema;
  }

  const objectLabelSingular = objectMetadataItem.labelSingular;

  return {
    ...outputSchema,
    before: {
      isLeaf: false,
      icon: 'IconHistory',
      label: t`${objectLabelSingular} Before Update`,
      value: generateRecordOutputSchema(objectMetadataItem),
    },
    updatedFields: {
      isLeaf: true,
      icon: 'IconListDetails',
      type: 'array',
      label: t`Updated Fields`,
      value: [],
    },
  };
};
