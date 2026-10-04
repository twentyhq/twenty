import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WaitForEventOutputSchema } from '@/workflow/workflow-variables/types/WaitForEventOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';

export const generateWaitForEventOutputSchema = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): WaitForEventOutputSchema => ({
  record: {
    isLeaf: false,
    icon: objectMetadataItem.icon ?? undefined,
    label: objectMetadataItem.labelSingular,
    value: generateRecordOutputSchema(objectMetadataItem),
  },
  hasTimedOut: {
    isLeaf: true,
    icon: 'IconClockX',
    type: 'boolean',
    label: 'Has Timed Out',
    value: false,
  },
});
