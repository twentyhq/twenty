import { type ConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/types/ConditionalAvailabilityCurrentUserContext';
import { type ConditionalAvailabilityDevice } from 'twenty-shared/conditional-availability';

export type WidgetVisibilityContext =
  ConditionalAvailabilityCurrentUserContext & {
    device: ConditionalAvailabilityDevice;
    selectedRecords: Record<string, unknown>[];
  };
