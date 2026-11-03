import { type ConditionalDisplay } from 'twenty-shared/types';
import {
  compileConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

export const compileLegacyConditionalExpression = (
  conditionalExpression: string | null | undefined,
): ConditionalDisplay | null =>
  isDefined(conditionalExpression)
    ? compileConditionalAvailabilityExpression(conditionalExpression)
    : null;
