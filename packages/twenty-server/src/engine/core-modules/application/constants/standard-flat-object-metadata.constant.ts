import { TWENTY_STANDARD_APPLICATION } from 'src/engine/core-modules/application/constants/twenty-standard-applications';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { AllStandardObjectFieldName } from 'src/engine/core-modules/application/types/all-standard-object-field-name.type';
import { AllStandardObjectName } from 'src/engine/core-modules/application/types/all-standard-object-name.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/core-modules/application/constants/get-standard-field-metadata-id-by-object-and-field-name.util';
import { STANDARD_OBJECTS } from './standard-object.constant';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

// Placeholder workspace ID for standard application constant
const PLACEHOLDER_WORKSPACE_ID = '';

const createStandardObjectFlatMetadata = <T extends AllStandardObjectName>({
  options: {
    universalIdentifier,
    standardId,
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    description,
    icon,
    isSystem = false,
    isSearchable = false,
    isAuditLogged = true,
    isUIReadOnly = false,
    shortcut = null,
    createdAt,
    labelIdentifierFieldMetadataName,
  },
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  options: {
    universalIdentifier: string;
    standardId: string;
    nameSingular: T;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    description: string;
    icon: string;
    isSystem?: boolean;
    isSearchable?: boolean;
    isAuditLogged?: boolean;
    isUIReadOnly?: boolean;
    shortcut?: string | null;
    createdAt: Date;
    labelIdentifierFieldMetadataName: AllStandardObjectFieldName<T>;
  };
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): FlatObjectMetadata => ({
  universalIdentifier,
  standardId,
  applicationId: TWENTY_STANDARD_APPLICATION_ID,
  workspaceId: PLACEHOLDER_WORKSPACE_ID,
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  icon,
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem,
  isSearchable,
  isAuditLogged,
  isUIReadOnly,
  isLabelSyncedWithName: false,
  standardOverrides: null,
  duplicateCriteria: null,
  shortcut,
  labelIdentifierFieldMetadataId:
    standardFieldMetadataIdByObjectAndFieldName[nameSingular].fields[
      labelIdentifierFieldMetadataName
    ],
  imageIdentifierFieldMetadataId: null,
  targetTableName: 'DEPRECATED',
  fieldMetadataIds: [],
  indexMetadataIds: [],
  viewIds: [],
  createdAt,
  updatedAt: createdAt,
  id: standardFieldMetadataIdByObjectAndFieldName[nameSingular].id,
});

// Helper to create placeholder fields for now
const createPlaceholderFields = <T extends AllStandardObjectName>(
  _objectName: T,
): Record<AllStandardObjectFieldName<T>, FlatFieldMetadata> => {
  return {} as Record<AllStandardObjectFieldName<T>, FlatFieldMetadata>;
};

export const buildStandardFlatObjectMetadatas = ({
  createdAt,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<string, FlatObjectMetadata> => ({
  attachment: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
      standardId: STANDARD_OBJECTS.attachment.universalIdentifier,
      nameSingular: 'attachment',
      namePlural: 'attachments',
      labelSingular: 'Attachment',
      labelPlural: 'Attachments',
      description: 'An attachment',
      icon: 'IconFileImport',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  blocklist: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
      standardId: STANDARD_OBJECTS.blocklist.universalIdentifier,
      nameSingular: 'blocklist',
      namePlural: 'blocklists',
      labelSingular: 'Blocklist',
      labelPlural: 'Blocklists',
      description: 'Blocklist',
      icon: 'IconForbid2',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarChannelEventAssociation: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
      standardId:
        STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
      nameSingular: 'calendarChannelEventAssociation',
      namePlural: 'calendarChannelEventAssociations',
      labelSingular: 'Calendar Channel Event Association',
      labelPlural: 'Calendar Channel Event Associations',
      description: 'Calendar Channel Event Associations',
      icon: 'IconCalendar',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarChannel: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.calendarChannel.universalIdentifier,
      standardId: STANDARD_OBJECTS.calendarChannel.universalIdentifier,
      nameSingular: 'calendarChannel',
      namePlural: 'calendarChannels',
      labelSingular: 'Calendar Channel',
      labelPlural: 'Calendar Channels',
      description: 'Calendar Channels',
      icon: 'IconCalendar',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarEventParticipant: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
      standardId: STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
      nameSingular: 'calendarEventParticipant',
      namePlural: 'calendarEventParticipants',
      labelSingular: 'Calendar event participant',
      labelPlural: 'Calendar event participants',
      description: 'Calendar event participants',
      icon: 'IconCalendar',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarEvent: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      standardId: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      nameSingular: 'calendarEvent',
      namePlural: 'calendarEvents',
      labelSingular: 'Calendar event',
      labelPlural: 'Calendar events',
      description: 'Calendar events',
      icon: 'IconCalendar',
      isSystem: true,
      isAuditLogged: false,
      isUIReadOnly: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'title',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  company: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      standardId: STANDARD_OBJECTS.company.universalIdentifier,
      nameSingular: 'company',
      namePlural: 'companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      icon: 'IconBuildingSkyscraper',
      isSearchable: true,
      shortcut: 'C',
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  connectedAccount: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.connectedAccount.universalIdentifier,
      standardId: STANDARD_OBJECTS.connectedAccount.universalIdentifier,
      nameSingular: 'connectedAccount',
      namePlural: 'connectedAccounts',
      labelSingular: 'Connected Account',
      labelPlural: 'Connected Accounts',
      description: 'A connected account',
      icon: 'IconAt',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  dashboard: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.dashboard.universalIdentifier,
      standardId: STANDARD_OBJECTS.dashboard.universalIdentifier,
      nameSingular: 'dashboard',
      namePlural: 'dashboards',
      labelSingular: 'Dashboard',
      labelPlural: 'Dashboards',
      description: 'A dashboard',
      icon: 'IconLayoutDashboard',
      isSearchable: true,
      shortcut: 'D',
      createdAt,
      labelIdentifierFieldMetadataName: 'title',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favorite: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.favorite.universalIdentifier,
      standardId: STANDARD_OBJECTS.favorite.universalIdentifier,
      nameSingular: 'favorite',
      namePlural: 'favorites',
      labelSingular: 'Favorite',
      labelPlural: 'Favorites',
      description: 'A favorite',
      icon: 'IconHeart',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favoriteFolder: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.favoriteFolder.universalIdentifier,
      standardId: STANDARD_OBJECTS.favoriteFolder.universalIdentifier,
      nameSingular: 'favoriteFolder',
      namePlural: 'favoriteFolders',
      labelSingular: 'Favorite Folder',
      labelPlural: 'Favorite Folders',
      description: 'A favorite folder',
      icon: 'IconFolder',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageChannelMessageAssociation: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
      standardId:
        STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
      nameSingular: 'messageChannelMessageAssociation',
      namePlural: 'messageChannelMessageAssociations',
      labelSingular: 'Message Channel Message Association',
      labelPlural: 'Message Channel Message Associations',
      description: 'Message Synced with a Message Channel',
      icon: 'IconMessage',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageChannel: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.messageChannel.universalIdentifier,
      standardId: STANDARD_OBJECTS.messageChannel.universalIdentifier,
      nameSingular: 'messageChannel',
      namePlural: 'messageChannels',
      labelSingular: 'Message Channel',
      labelPlural: 'Message Channels',
      description: 'Message Channels',
      icon: 'IconMessage',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageFolder: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.messageFolder.universalIdentifier,
      standardId: STANDARD_OBJECTS.messageFolder.universalIdentifier,
      nameSingular: 'messageFolder',
      namePlural: 'messageFolders',
      labelSingular: 'Message Folder',
      labelPlural: 'Message Folders',
      description: 'Message Folders',
      icon: 'IconFolder',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageParticipant: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.messageParticipant.universalIdentifier,
      standardId: STANDARD_OBJECTS.messageParticipant.universalIdentifier,
      nameSingular: 'messageParticipant',
      namePlural: 'messageParticipants',
      labelSingular: 'Message Participant',
      labelPlural: 'Message Participants',
      description: 'Message Participants',
      icon: 'IconUserCircle',
      isSystem: true,
      isAuditLogged: false,
      createdAt,
      labelIdentifierFieldMetadataName: 'handle',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageThread: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
      standardId: STANDARD_OBJECTS.messageThread.universalIdentifier,
      nameSingular: 'messageThread',
      namePlural: 'messageThreads',
      labelSingular: 'Message Thread',
      labelPlural: 'Message Threads',
      description: 'Message Thread',
      icon: 'IconMessage',
      isSystem: true,
      isAuditLogged: false,
      isUIReadOnly: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  message: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
      standardId: STANDARD_OBJECTS.message.universalIdentifier,
      nameSingular: 'message',
      namePlural: 'messages',
      labelSingular: 'Message',
      labelPlural: 'Messages',
      description: 'Message',
      icon: 'IconMessage',
      isSystem: true,
      isAuditLogged: false,
      isUIReadOnly: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'subject',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  note: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      standardId: STANDARD_OBJECTS.note.universalIdentifier,
      nameSingular: 'note',
      namePlural: 'notes',
      labelSingular: 'Note',
      labelPlural: 'Notes',
      description: 'A note',
      icon: 'IconNotes',
      isSearchable: true,
      shortcut: 'N',
      createdAt,
      labelIdentifierFieldMetadataName: 'title',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  noteTarget: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
      standardId: STANDARD_OBJECTS.noteTarget.universalIdentifier,
      nameSingular: 'noteTarget',
      namePlural: 'noteTargets',
      labelSingular: 'Note Target',
      labelPlural: 'Note Targets',
      description: 'A note target',
      icon: 'IconCheckbox',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  opportunity: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
      standardId: STANDARD_OBJECTS.opportunity.universalIdentifier,
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
      labelSingular: 'Opportunity',
      labelPlural: 'Opportunities',
      description: 'An opportunity',
      icon: 'IconTargetArrow',
      isSearchable: true,
      shortcut: 'O',
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  person: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      standardId: STANDARD_OBJECTS.person.universalIdentifier,
      nameSingular: 'person',
      namePlural: 'people',
      labelSingular: 'Person',
      labelPlural: 'People',
      description: 'A person',
      icon: 'IconUser',
      isSearchable: true,
      shortcut: 'P',
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  task: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
      standardId: STANDARD_OBJECTS.task.universalIdentifier,
      nameSingular: 'task',
      namePlural: 'tasks',
      labelSingular: 'Task',
      labelPlural: 'Tasks',
      description: 'A task',
      icon: 'IconCheckbox',
      isSearchable: true,
      shortcut: 'T',
      createdAt,
      labelIdentifierFieldMetadataName: 'title',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  taskTarget: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
      standardId: STANDARD_OBJECTS.taskTarget.universalIdentifier,
      nameSingular: 'taskTarget',
      namePlural: 'taskTargets',
      labelSingular: 'Task Target',
      labelPlural: 'Task Targets',
      description: 'A task target',
      icon: 'IconCheckbox',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  timelineActivity: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      standardId: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      nameSingular: 'timelineActivity',
      namePlural: 'timelineActivities',
      labelSingular: 'Timeline Activity',
      labelPlural: 'Timeline Activities',
      description:
        'Aggregated / filtered event to be displayed on the timeline',
      icon: 'IconTimelineEvent',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workflow: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
      standardId: STANDARD_OBJECTS.workflow.universalIdentifier,
      nameSingular: 'workflow',
      namePlural: 'workflows',
      labelSingular: 'Workflow',
      labelPlural: 'Workflows',
      description: 'A workflow',
      icon: 'IconSettingsAutomation',
      isSearchable: true,
      shortcut: 'W',
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workflowAutomatedTrigger: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier:
        STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
      standardId: STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
      nameSingular: 'workflowAutomatedTrigger',
      namePlural: 'workflowAutomatedTriggers',
      labelSingular: 'Workflow Automated Trigger',
      labelPlural: 'Workflow Automated Triggers',
      description: 'A workflow automated trigger',
      icon: 'IconSettingsAutomation',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'id',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workflowRun: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
      standardId: STANDARD_OBJECTS.workflowRun.universalIdentifier,
      nameSingular: 'workflowRun',
      namePlural: 'workflowRuns',
      labelSingular: 'Workflow Run',
      labelPlural: 'Workflow Runs',
      description: 'A workflow run',
      icon: 'IconHistoryToggle',
      isSearchable: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workflowVersion: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      standardId: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      nameSingular: 'workflowVersion',
      namePlural: 'workflowVersions',
      labelSingular: 'Workflow Version',
      labelPlural: 'Workflow Versions',
      description: 'A workflow version',
      icon: 'IconVersions',
      isSearchable: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workspaceMember: createStandardObjectFlatMetadata({
    options: {
      universalIdentifier: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
      standardId: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
      nameSingular: 'workspaceMember',
      namePlural: 'workspaceMembers',
      labelSingular: 'Workspace Member',
      labelPlural: 'Workspace Members',
      description: 'A workspace member',
      icon: 'IconUserCircle',
      isSystem: true,
      createdAt,
      labelIdentifierFieldMetadataName: 'name',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
