import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';

export type ConditionalAvailabilityRowSubject =
  | { subject: ConditionalAvailabilitySubject }
  | ({ subject: 'recordField' } & ConditionalAvailabilityRecordFieldSubject);
