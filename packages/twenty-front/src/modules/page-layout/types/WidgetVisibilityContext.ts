import { type ConditionalAvailabilityDevice } from 'twenty-shared/conditional-availability';

export type WidgetVisibilityContext = {
  device: ConditionalAvailabilityDevice;
  selectedRecords: Record<string, unknown>[];
  featureFlags: Record<string, boolean>;
};
