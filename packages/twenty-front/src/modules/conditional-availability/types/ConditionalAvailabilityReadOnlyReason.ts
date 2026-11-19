export type ConditionalAvailabilityReadOnlyReason =
  | { status: 'editable' }
  | { status: 'readOnly'; reason: 'roles' | 'featureFlags' };
