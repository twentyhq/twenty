import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WaitForEventOutputSchema } from '@/workflow/workflow-variables/types/WaitForEventOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
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
      label: 'Record ID',
      value: '',
    },
    hasTimedOut: {
      isLeaf: true,
      icon: 'IconClockX',
      type: 'boolean',
      label: 'Has Timed Out',
      value: false,
    },
  };

  if (
    action !== DatabaseEventAction.UPDATED &&
    action !== DatabaseEventAction.UPSERTED
  ) {
    return outputSchema;
  }

  return {
    ...outputSchema,
    before: {
      isLeaf: false,
      icon: 'IconHistory',
      label: `${objectMetadataItem.labelSingular} Before Update`,
      value: generateRecordOutputSchema(objectMetadataItem),
    },
    updatedFields: {
      isLeaf: true,
      icon: 'IconListDetails',
      type: 'array',
      label: 'Updated Fields',
      value: [],
    },
  };
};
