export type FrontComponentExecutionContext = {
  frontComponentId: string;
  userId: string | null;
  /**
   * @deprecated Use `selectedRecordIds` instead. Derive single record as `selectedRecordIds.length === 1 ? selectedRecordIds[0] : null`.
   */
  recordId: string | null;
  /** All selected record IDs */
  selectedRecordIds: string[];
  /**
   * The host's RESOLVED color scheme ('System' preference already collapsed to
   * 'Light' | 'Dark' via prefers-color-scheme). Front-components run in a Web
   * Worker with no DOM/matchMedia, so they cannot detect the theme themselves —
   * the host resolves it on the main thread and passes it through here. Read it
   * with the `useColorScheme()` hook.
   */
  colorScheme: 'Light' | 'Dark';
};
