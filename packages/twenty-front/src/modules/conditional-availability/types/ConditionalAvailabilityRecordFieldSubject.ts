import { type ConditionalAvailabilityRecordFieldKind } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldKind';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';

export type ConditionalAvailabilityRecordFieldSubject = {
  fieldMetadataUniversalIdentifier: string;
  fieldName: string;
  subFieldName: CompositeFieldSubFieldName | null;
  fieldKind: ConditionalAvailabilityRecordFieldKind;
  propertyPath: string;
};
