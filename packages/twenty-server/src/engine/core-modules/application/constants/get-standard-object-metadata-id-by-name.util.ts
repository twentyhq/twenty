import { AllStandardObjectName } from 'src/engine/core-modules/application/types/all-standard-object-name.type';
import { v4 } from 'uuid';

export type StandardObjectMetadataIdByName = Record<AllStandardObjectName, string>;

// TODO remove once we have refactored the builder to iterate over universalIdentifier only
export const getStandardObjectMetadataIdByName = (): StandardObjectMetadataIdByName => ({
  attachment: v4(),
  blocklist: v4(),
  calendarChannel: v4(),
  calendarChannelEventAssociation: v4(),
  calendarEvent: v4(),
  calendarEventParticipant: v4(),
  company: v4(),
  connectedAccount: v4(),
  dashboard: v4(),
  favorite: v4(),
  favoriteFolder: v4(),
  message: v4(),
  messageChannel: v4(),
  messageChannelMessageAssociation: v4(),
  messageFolder: v4(),
  messageParticipant: v4(),
  messageThread: v4(),
  note: v4(),
  noteTarget: v4(),
  opportunity: v4(),
  person: v4(),
  task: v4(),
  taskTarget: v4(),
  timelineActivity: v4(),
  workflow: v4(),
  workflowAutomatedTrigger: v4(),
  workflowRun: v4(),
  workflowVersion: v4(),
  workspaceMember: v4(),
});
