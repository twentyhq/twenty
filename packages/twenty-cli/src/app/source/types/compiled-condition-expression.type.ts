import { type ConditionalDisplay } from 'twenty-shared/types';

export type CompiledConditionExpression =
  | { conditionalDisplay: ConditionalDisplay | null }
  | { errorMessage: string };
