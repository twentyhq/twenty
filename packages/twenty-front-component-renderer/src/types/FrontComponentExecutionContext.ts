export type FrontComponentExecutionContext = {
  frontComponentId: string;
  userId: string | null;
  /**
   * @deprecated Use `recordIds` instead. Returns first selected record ID or null.
   */
  recordId: string | null;
  recordIds: string[];
};
