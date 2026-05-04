export type FrontComponentExecutionContext = {
  frontComponentId: string;
  userId: string | null;
  /**
   * @deprecated Use `recordIds` instead. Derive single record as `recordIds.length === 1 ? recordIds[0] : null`.
   */
  recordId: string | null;
  /** All selected record IDs */
  recordIds: string[];
};
