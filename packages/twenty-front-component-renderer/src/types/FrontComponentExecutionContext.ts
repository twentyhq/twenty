import { type AppLocale } from 'twenty-shared/translations';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';

export type FrontComponentExecutionContext = {
  frontComponentId: string;
  userId: string | null;
  /**
   * @deprecated Use `selectedRecordIds` instead. Derive single record as `selectedRecordIds.length === 1 ? selectedRecordIds[0] : null`.
   */
  recordId: string | null;
  /** All selected record IDs */
  selectedRecordIds: string[];
  timelineActivityId: string | null;
  /** Resolved color scheme of the host UI ('System' is already resolved) */
  colorScheme: 'light' | 'dark';
  locale?: AppLocale;
  /** Set when the component renders an AI chat tool call */
  toolCall?: FrontComponentToolCall;
};
