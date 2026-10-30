// Captured when the revision is prepared and rechecked at execution, so an
// approval only ever applies to the world the reviewer saw.
export type SetuAiActionPreconditions = {
  recordUpdatedAt?: string | null;
  fieldValuesBefore?: Record<string, unknown>;
};
