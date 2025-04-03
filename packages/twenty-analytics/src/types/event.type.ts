import { z } from 'zod';
import {
  eventSchema,
  apiKeyCreatedSchema,
  attachmentCreatedSchema,
  auditLogCreatedSchema,
  blocklistCreatedSchema,
  calendarChannelCreatedSchema,
  calendarChannelEventAssociationCreatedSchema,
  calendarEventCreatedSchema,
  calendarEventParticipantCreatedSchema,
  companyCreatedSchema,
  connectedAccountCreatedSchema,
  customDomainActivatedSchema,
  customDomainCreatedSchema,
  favoriteCreatedSchema,
  functionExecuteSchema,
  messageCreatedSchema,
  messageChannelCreatedSchema,
  messageChannelMessageAssociationCreatedSchema,
  messageParticipantCreatedSchema,
  messageThreadCreatedSchema,
  noteCreatedSchema,
  noteTargetCreatedSchema,
  opportunityCreatedSchema,
  personCreatedSchema,
  serverlessFunctionExecutedSchema,
  taskCreatedSchema,
  taskTargetCreatedSchema,
  timelineActivityCreatedSchema,
  viewCreatedSchema,
  viewFieldCreatedSchema,
  viewFilterCreatedSchema,
  viewSortCreatedSchema,
  webhookCreatedSchema,
  webhookResponseSchema,
  workspaceMemberCreatedSchema,
} from '../events';
import { CommonPropertiesType } from '@/types/common.type';

export type EventSchema =
  | typeof apiKeyCreatedSchema
  | typeof attachmentCreatedSchema
  | typeof auditLogCreatedSchema
  | typeof blocklistCreatedSchema
  | typeof calendarChannelCreatedSchema
  | typeof calendarChannelEventAssociationCreatedSchema
  | typeof calendarEventCreatedSchema
  | typeof calendarEventParticipantCreatedSchema
  | typeof companyCreatedSchema
  | typeof connectedAccountCreatedSchema
  | typeof customDomainActivatedSchema
  | typeof customDomainCreatedSchema
  | typeof favoriteCreatedSchema
  | typeof functionExecuteSchema
  | typeof messageCreatedSchema
  | typeof messageChannelCreatedSchema
  | typeof messageChannelMessageAssociationCreatedSchema
  | typeof messageParticipantCreatedSchema
  | typeof messageThreadCreatedSchema
  | typeof noteCreatedSchema
  | typeof noteTargetCreatedSchema
  | typeof opportunityCreatedSchema
  | typeof personCreatedSchema
  | typeof serverlessFunctionExecutedSchema
  | typeof taskCreatedSchema
  | typeof taskTargetCreatedSchema
  | typeof timelineActivityCreatedSchema
  | typeof viewCreatedSchema
  | typeof viewFieldCreatedSchema
  | typeof viewFilterCreatedSchema
  | typeof viewSortCreatedSchema
  | typeof webhookCreatedSchema
  | typeof webhookResponseSchema
  | typeof workspaceMemberCreatedSchema;

export type Event = z.infer<typeof eventSchema>;
export type EventWithoutCommonKeys = Omit<Event, CommonPropertiesType>;

export type ApiKeyCreatedEvent = z.infer<typeof apiKeyCreatedSchema>;
export type AttachmentCreatedEvent = z.infer<typeof attachmentCreatedSchema>;
export type AuditLogCreatedEvent = z.infer<typeof auditLogCreatedSchema>;
export type BlocklistCreatedEvent = z.infer<typeof blocklistCreatedSchema>;
export type CalendarChannelCreatedEvent = z.infer<
  typeof calendarChannelCreatedSchema
>;
export type CalendarChannelEventAssociationCreatedEvent = z.infer<
  typeof calendarChannelEventAssociationCreatedSchema
>;
export type CalendarEventCreatedEvent = z.infer<
  typeof calendarEventCreatedSchema
>;
export type CalendarEventParticipantCreatedEvent = z.infer<
  typeof calendarEventParticipantCreatedSchema
>;
export type CompanyCreatedEvent = z.infer<typeof companyCreatedSchema>;
export type ConnectedAccountCreatedEvent = z.infer<
  typeof connectedAccountCreatedSchema
>;
export type CustomDomainActivatedEvent = z.infer<
  typeof customDomainActivatedSchema
>;
export type CustomDomainCreatedEvent = z.infer<
  typeof customDomainCreatedSchema
>;
export type FavoriteCreatedEvent = z.infer<typeof favoriteCreatedSchema>;
export type FunctionExecuteEvent = z.infer<typeof functionExecuteSchema>;
export type MessageCreatedEvent = z.infer<typeof messageCreatedSchema>;
export type MessageChannelCreatedEvent = z.infer<
  typeof messageChannelCreatedSchema
>;
export type MessageChannelMessageAssociationCreatedEvent = z.infer<
  typeof messageChannelMessageAssociationCreatedSchema
>;
export type MessageParticipantCreatedEvent = z.infer<
  typeof messageParticipantCreatedSchema
>;
export type MessageThreadCreatedEvent = z.infer<
  typeof messageThreadCreatedSchema
>;
export type NoteCreatedEvent = z.infer<typeof noteCreatedSchema>;
export type NoteTargetCreatedEvent = z.infer<typeof noteTargetCreatedSchema>;
export type OpportunityCreatedEvent = z.infer<typeof opportunityCreatedSchema>;
export type PersonCreatedEvent = z.infer<typeof personCreatedSchema>;
export type ServerlessFunctionExecutedEvent = z.infer<
  typeof serverlessFunctionExecutedSchema
>;
export type TaskCreatedEvent = z.infer<typeof taskCreatedSchema>;
export type TaskTargetCreatedEvent = z.infer<typeof taskTargetCreatedSchema>;
export type TimelineActivityCreatedEvent = z.infer<
  typeof timelineActivityCreatedSchema
>;
export type ViewCreatedEvent = z.infer<typeof viewCreatedSchema>;
export type ViewFieldCreatedEvent = z.infer<typeof viewFieldCreatedSchema>;
export type ViewFilterCreatedEvent = z.infer<typeof viewFilterCreatedSchema>;
export type ViewSortCreatedEvent = z.infer<typeof viewSortCreatedSchema>;
export type WebhookCreatedEvent = z.infer<typeof webhookCreatedSchema>;
export type WebhookResponseEvent = z.infer<typeof webhookResponseSchema>;
export type WorkspaceMemberCreatedEvent = z.infer<
  typeof workspaceMemberCreatedSchema
>;

// Union type of all specific event types
export type SpecificEventType =
  | ApiKeyCreatedEvent
  | AttachmentCreatedEvent
  | AuditLogCreatedEvent
  | BlocklistCreatedEvent
  | CalendarChannelCreatedEvent
  | CalendarChannelEventAssociationCreatedEvent
  | CalendarEventCreatedEvent
  | CalendarEventParticipantCreatedEvent
  | CompanyCreatedEvent
  | ConnectedAccountCreatedEvent
  | CustomDomainActivatedEvent
  | CustomDomainCreatedEvent
  | FavoriteCreatedEvent
  | FunctionExecuteEvent
  | MessageCreatedEvent
  | MessageChannelCreatedEvent
  | MessageChannelMessageAssociationCreatedEvent
  | MessageParticipantCreatedEvent
  | MessageThreadCreatedEvent
  | NoteCreatedEvent
  | NoteTargetCreatedEvent
  | OpportunityCreatedEvent
  | PersonCreatedEvent
  | ServerlessFunctionExecutedEvent
  | TaskCreatedEvent
  | TaskTargetCreatedEvent
  | TimelineActivityCreatedEvent
  | ViewCreatedEvent
  | ViewFieldCreatedEvent
  | ViewFilterCreatedEvent
  | ViewSortCreatedEvent
  | WebhookCreatedEvent
  | WebhookResponseEvent
  | WorkspaceMemberCreatedEvent;

// Export a value for SpecificEvent that can be used at runtime
export const SpecificEvent = {
  apiKeyCreatedSchema,
  attachmentCreatedSchema,
  auditLogCreatedSchema,
  blocklistCreatedSchema,
  calendarChannelCreatedSchema,
  calendarChannelEventAssociationCreatedSchema,
  calendarEventCreatedSchema,
  calendarEventParticipantCreatedSchema,
  companyCreatedSchema,
  connectedAccountCreatedSchema,
  customDomainActivatedSchema,
  customDomainCreatedSchema,
  favoriteCreatedSchema,
  functionExecuteSchema,
  messageCreatedSchema,
  messageChannelCreatedSchema,
  messageChannelMessageAssociationCreatedSchema,
  messageParticipantCreatedSchema,
  messageThreadCreatedSchema,
  noteCreatedSchema,
  noteTargetCreatedSchema,
  opportunityCreatedSchema,
  personCreatedSchema,
  serverlessFunctionExecutedSchema,
  taskCreatedSchema,
  taskTargetCreatedSchema,
  timelineActivityCreatedSchema,
  viewCreatedSchema,
  viewFieldCreatedSchema,
  viewFilterCreatedSchema,
  viewSortCreatedSchema,
  webhookCreatedSchema,
  webhookResponseSchema,
  workspaceMemberCreatedSchema,
};
