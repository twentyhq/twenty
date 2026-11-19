import { type ConditionalAvailabilityRecordFilterField } from '@/conditional-availability/types/ConditionalAvailabilityRecordFilterField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier =
  ({
    objectMetadataItems,
  }: {
    objectMetadataItems: EnrichedObjectMetadataItem[];
  }): Map<string, ConditionalAvailabilityRecordFilterField> =>
    new Map(
      objectMetadataItems.flatMap((objectMetadataItem) =>
        objectMetadataItem.fields.map(
          (fieldMetadataItem) =>
            [
              fieldMetadataItem.universalIdentifier,
              { objectMetadataItem, fieldMetadataItem },
            ] as const,
        ),
      ),
    );
