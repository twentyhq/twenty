import { type AppLocale } from 'twenty-shared/translations';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FrontComponentSelectedObjectMetadata } from './FrontComponentSelectedObjectMetadata';
import { type FrontComponentToolCall } from './FrontComponentToolCall';

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
   * Filter matching exactly the selected records. Under Select all,
   * `selectedRecordIds` is empty and only this filter describes the selection.
   */
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
  selectedObjectMetadata?: FrontComponentSelectedObjectMetadata | null;
  timelineActivityId: string | null;
  /** Resolved color scheme of the host UI ('System' is already resolved) */
  colorScheme: 'light' | 'dark';
  locale?: AppLocale;
  /** Set when the component renders an AI chat tool call */
  toolCall?: FrontComponentToolCall;
};
