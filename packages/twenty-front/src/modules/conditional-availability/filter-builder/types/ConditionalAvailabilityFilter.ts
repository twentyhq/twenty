import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import {
  type ExpressionFieldNode,
  type ExpressionLiteralNode,
} from 'twenty-shared/expression';

export type ConditionalAvailabilityFilter = {
  type: 'filter';
  id: string;
  operator: ConditionalAvailabilityFilterOperator;
  values: ExpressionLiteralNode['value'][];
} & (
  | { variable: ConditionalAvailabilityFilterVariable }
  | { field: ExpressionFieldNode }
);
