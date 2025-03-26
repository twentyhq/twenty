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
} from '../src/events';

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
