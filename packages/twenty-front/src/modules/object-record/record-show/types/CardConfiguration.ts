import { type CardType } from '@/object-record/record-show/types/CardType';

// Card configuration types - each card type can define its own configuration
export type FieldCardConfiguration = {
  showDuplicatesSection?: boolean;
};

// For cards that don't need configuration, use undefined
export type EmptyCardConfiguration = undefined;

// Type mapping from CardType to its specific configuration type
// This creates precise typing: each CardType is linked to exactly one configuration type
export type CardTypeToConfiguration = {
  [CardType.FieldCard]: FieldCardConfiguration;
  [CardType.TimelineCard]: EmptyCardConfiguration;
  [CardType.TaskCard]: EmptyCardConfiguration;
  [CardType.NoteCard]: EmptyCardConfiguration;
  [CardType.FileCard]: EmptyCardConfiguration;
  [CardType.EmailCard]: EmptyCardConfiguration;
  [CardType.CalendarCard]: EmptyCardConfiguration;
  [CardType.FieldRichTextCard]: EmptyCardConfiguration;
  [CardType.WorkflowCard]: EmptyCardConfiguration;
  [CardType.WorkflowVersionCard]: EmptyCardConfiguration;
  [CardType.WorkflowRunCard]: EmptyCardConfiguration;
  [CardType.DashboardCard]: EmptyCardConfiguration;
};

// Union type for all card configurations (for general use)
export type CardConfiguration = FieldCardConfiguration | EmptyCardConfiguration;
