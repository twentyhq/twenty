// Card configuration types - each card type can define its own configuration
// Similar to widget configurations on the backend

export type FieldCardConfiguration = {
  showDuplicatesSection?: boolean;
};

// Placeholder for future card configurations
export type TimelineCardConfiguration = Record<string, never>;
export type TaskCardConfiguration = Record<string, never>;
export type NoteCardConfiguration = Record<string, never>;
export type FileCardConfiguration = Record<string, never>;
export type EmailCardConfiguration = Record<string, never>;
export type CalendarCardConfiguration = Record<string, never>;
export type RichTextCardConfiguration = Record<string, never>;
export type WorkflowCardConfiguration = Record<string, never>;
export type WorkflowVersionCardConfiguration = Record<string, never>;
export type WorkflowRunCardConfiguration = Record<string, never>;
export type DashboardCardConfiguration = Record<string, never>;

// Union type for all card configurations
export type CardConfiguration =
  | FieldCardConfiguration
  | TimelineCardConfiguration
  | TaskCardConfiguration
  | NoteCardConfiguration
  | FileCardConfiguration
  | EmailCardConfiguration
  | CalendarCardConfiguration
  | RichTextCardConfiguration
  | WorkflowCardConfiguration
  | WorkflowVersionCardConfiguration
  | WorkflowRunCardConfiguration
  | DashboardCardConfiguration;
