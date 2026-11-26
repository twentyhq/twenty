import { type ConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/types/ConditionalAvailabilityCurrentUserContext';
import { type ConditionalEvaluationDevice } from 'twenty-shared/conditional-evaluation';

export type WidgetVisibilityContext =
  ConditionalAvailabilityCurrentUserContext & {
    device: ConditionalEvaluationDevice;
    selectedRecords: Record<string, unknown>[];
  };
