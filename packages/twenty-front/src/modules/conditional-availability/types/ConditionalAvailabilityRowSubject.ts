import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';

export type ConditionalAvailabilityRowSubject =
  | { subject: ConditionalAvailabilityPathSubject }
  | ({ subject: 'recordField' } & ConditionalAvailabilityRecordFieldSubject);
