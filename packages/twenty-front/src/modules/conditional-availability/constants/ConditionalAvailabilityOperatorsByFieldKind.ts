import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRecordFieldKind } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldKind';

export const CONDITIONAL_AVAILABILITY_OPERATORS_BY_FIELD_KIND: Record<
  ConditionalAvailabilityRecordFieldKind,
  ConditionalAvailabilityOperator[]
> = {
  text: ['is', 'isNot', 'contains', 'doesNotContain', 'isEmpty', 'isNotEmpty'],
  identifier: ['is', 'isNot', 'isEmpty', 'isNotEmpty'],
  number: ['is', 'isNot', 'atLeast', 'atMost', 'isEmpty', 'isNotEmpty'],
  currencyAmount: ['is', 'isNot', 'atLeast', 'atMost', 'isEmpty', 'isNotEmpty'],
  boolean: ['is'],
  select: ['isAnyOf', 'isNoneOf', 'isEmpty', 'isNotEmpty'],
  multiSelect: ['contains', 'doesNotContain', 'isEmpty', 'isNotEmpty'],
  list: ['contains', 'doesNotContain', 'isEmpty', 'isNotEmpty'],
  date: [
    'is',
    'before',
    'after',
    'isInPast',
    'isInFuture',
    'isEmpty',
    'isNotEmpty',
  ],
  dateTime: [
    'is',
    'before',
    'after',
    'isInPast',
    'isInFuture',
    'isEmpty',
    'isNotEmpty',
  ],
  workspaceMemberRelation: [
    'is',
    'isNot',
    'isAnyOf',
    'isNoneOf',
    'isEmpty',
    'isNotEmpty',
  ],
  recordRelation: [
    'is',
    'isNot',
    'isAnyOf',
    'isNoneOf',
    'isEmpty',
    'isNotEmpty',
  ],
  emptinessOnly: ['isEmpty', 'isNotEmpty'],
};
