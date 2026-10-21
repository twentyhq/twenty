import { hasConditionalDisplayRule } from '@/conditional-display/utils/hasConditionalDisplayRule';
import { t } from '@lingui/core/macro';
import { type ConditionalDisplay } from 'twenty-shared/types';

export const getConditionalDisplaySummaryLabel = (
  conditionalDisplay: ConditionalDisplay | null | undefined,
): string =>
  hasConditionalDisplayRule(conditionalDisplay) ? t`Custom rule` : t`Everyone`;
