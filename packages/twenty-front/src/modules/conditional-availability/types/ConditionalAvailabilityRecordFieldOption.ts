import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type ConditionalAvailabilityRecordFieldOption = {
  field: FieldMetadataItem;
  subjects: ConditionalAvailabilityRecordFieldSubject[] & {
    0: ConditionalAvailabilityRecordFieldSubject;
  };
};
