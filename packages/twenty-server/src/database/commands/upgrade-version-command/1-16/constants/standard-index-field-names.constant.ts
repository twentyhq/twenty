import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

// Maps indexName to its related field universal identifiers for each standard object
export const STANDARD_INDEX_FIELD_UNIVERSAL_IDENTIFIERS: Record<
  string,
  Record<string, string[]>
> = {
  attachment: {
    taskIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetTask.universalIdentifier,
    ],
    noteIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetNote.universalIdentifier,
    ],
    personIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetPerson.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetCompany.universalIdentifier,
    ],
    opportunityIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetOpportunity.universalIdentifier,
    ],
    dashboardIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetDashboard.universalIdentifier,
    ],
    workflowIdIndex: [
      STANDARD_OBJECTS.attachment.fields.targetWorkflow.universalIdentifier,
    ],
  },
  blocklist: {
    workspaceMemberIdIndex: [
      STANDARD_OBJECTS.blocklist.fields.workspaceMember.universalIdentifier,
    ],
  },
  calendarChannelEventAssociation: {
    calendarChannelIdIndex: [
      STANDARD_OBJECTS.calendarChannelEventAssociation.fields.calendarChannel
        .universalIdentifier,
    ],
    calendarEventIdIndex: [
      STANDARD_OBJECTS.calendarChannelEventAssociation.fields.calendarEvent
        .universalIdentifier,
    ],
  },
  calendarChannel: {
    connectedAccountIdIndex: [
      STANDARD_OBJECTS.calendarChannel.fields.connectedAccount
        .universalIdentifier,
    ],
  },
  calendarEventParticipant: {
    calendarEventIdIndex: [
      STANDARD_OBJECTS.calendarEventParticipant.fields.calendarEvent
        .universalIdentifier,
    ],
    personIdIndex: [
      STANDARD_OBJECTS.calendarEventParticipant.fields.person
        .universalIdentifier,
    ],
    workspaceMemberIdIndex: [
      STANDARD_OBJECTS.calendarEventParticipant.fields.workspaceMember
        .universalIdentifier,
    ],
  },
  company: {
    accountOwnerIdIndex: [
      STANDARD_OBJECTS.company.fields.accountOwner.universalIdentifier,
    ],
    domainNameUniqueIndex: [
      STANDARD_OBJECTS.company.fields.domainName.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.company.fields.searchVector.universalIdentifier,
    ],
  },
  connectedAccount: {
    accountOwnerIdIndex: [
      STANDARD_OBJECTS.connectedAccount.fields.accountOwner.universalIdentifier,
    ],
  },
  dashboard: {
    searchVectorGinIndex: [
      STANDARD_OBJECTS.dashboard.fields.searchVector.universalIdentifier,
    ],
  },
  favorite: {
    forWorkspaceMemberIdIndex: [
      STANDARD_OBJECTS.favorite.fields.forWorkspaceMember.universalIdentifier,
    ],
    personIdIndex: [
      STANDARD_OBJECTS.favorite.fields.person.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.favorite.fields.company.universalIdentifier,
    ],
    favoriteFolderIdIndex: [
      STANDARD_OBJECTS.favorite.fields.favoriteFolder.universalIdentifier,
    ],
    opportunityIdIndex: [
      STANDARD_OBJECTS.favorite.fields.opportunity.universalIdentifier,
    ],
    workflowIdIndex: [
      STANDARD_OBJECTS.favorite.fields.workflow.universalIdentifier,
    ],
    workflowVersionIdIndex: [
      STANDARD_OBJECTS.favorite.fields.workflowVersion.universalIdentifier,
    ],
    workflowRunIdIndex: [
      STANDARD_OBJECTS.favorite.fields.workflowRun.universalIdentifier,
    ],
    taskIdIndex: [STANDARD_OBJECTS.favorite.fields.task.universalIdentifier],
    noteIdIndex: [STANDARD_OBJECTS.favorite.fields.note.universalIdentifier],
    dashboardIdIndex: [
      STANDARD_OBJECTS.favorite.fields.dashboard.universalIdentifier,
    ],
  },
  messageChannelMessageAssociation: {
    messageChannelIdIndex: [
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.messageChannel
        .universalIdentifier,
    ],
    messageIdIndex: [
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.message
        .universalIdentifier,
    ],
    messageChannelIdMessageIdUniqueIndex: [
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.messageChannel
        .universalIdentifier,
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.message
        .universalIdentifier,
    ],
  },
  messageChannel: {
    connectedAccountIdIndex: [
      STANDARD_OBJECTS.messageChannel.fields.connectedAccount
        .universalIdentifier,
    ],
  },
  messageFolder: {
    messageChannelIdIndex: [
      STANDARD_OBJECTS.messageFolder.fields.messageChannel.universalIdentifier,
    ],
  },
  messageParticipant: {
    messageIdIndex: [
      STANDARD_OBJECTS.messageParticipant.fields.message.universalIdentifier,
    ],
    personIdIndex: [
      STANDARD_OBJECTS.messageParticipant.fields.person.universalIdentifier,
    ],
    workspaceMemberIdIndex: [
      STANDARD_OBJECTS.messageParticipant.fields.workspaceMember
        .universalIdentifier,
    ],
  },
  message: {
    messageThreadIdIndex: [
      STANDARD_OBJECTS.message.fields.messageThread.universalIdentifier,
    ],
  },
  note: {
    searchVectorGinIndex: [
      STANDARD_OBJECTS.note.fields.searchVector.universalIdentifier,
    ],
  },
  noteTarget: {
    noteIdIndex: [STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier],
    personIdIndex: [
      STANDARD_OBJECTS.noteTarget.fields.person.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.noteTarget.fields.company.universalIdentifier,
    ],
    opportunityIdIndex: [
      STANDARD_OBJECTS.noteTarget.fields.opportunity.universalIdentifier,
    ],
  },
  opportunity: {
    pointOfContactIdIndex: [
      STANDARD_OBJECTS.opportunity.fields.pointOfContact.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.opportunity.fields.company.universalIdentifier,
    ],
    stageIndex: [STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.opportunity.fields.searchVector.universalIdentifier,
    ],
  },
  person: {
    companyIdIndex: [
      STANDARD_OBJECTS.person.fields.company.universalIdentifier,
    ],
    emailsUniqueIndex: [
      STANDARD_OBJECTS.person.fields.emails.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.person.fields.searchVector.universalIdentifier,
    ],
  },
  task: {
    assigneeIdIndex: [
      STANDARD_OBJECTS.task.fields.assignee.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.task.fields.searchVector.universalIdentifier,
    ],
  },
  taskTarget: {
    taskIdIndex: [STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier],
    personIdIndex: [
      STANDARD_OBJECTS.taskTarget.fields.person.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.taskTarget.fields.company.universalIdentifier,
    ],
    opportunityIdIndex: [
      STANDARD_OBJECTS.taskTarget.fields.opportunity.universalIdentifier,
    ],
  },
  timelineActivity: {
    workspaceMemberIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.workspaceMember
        .universalIdentifier,
    ],
    personIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetPerson.universalIdentifier,
    ],
    companyIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetCompany
        .universalIdentifier,
    ],
    opportunityIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetOpportunity
        .universalIdentifier,
    ],
    noteIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetNote.universalIdentifier,
    ],
    taskIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetTask.universalIdentifier,
    ],
    workflowIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetWorkflow
        .universalIdentifier,
    ],
    workflowVersionIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowVersion
        .universalIdentifier,
    ],
    workflowRunIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowRun
        .universalIdentifier,
    ],
    dashboardIdIndex: [
      STANDARD_OBJECTS.timelineActivity.fields.targetDashboard
        .universalIdentifier,
    ],
  },
  workflow: {
    searchVectorGinIndex: [
      STANDARD_OBJECTS.workflow.fields.searchVector.universalIdentifier,
    ],
  },
  workflowAutomatedTrigger: {
    workflowIdIndex: [
      STANDARD_OBJECTS.workflowAutomatedTrigger.fields.workflow
        .universalIdentifier,
    ],
  },
  workflowRun: {
    workflowVersionIdIndex: [
      STANDARD_OBJECTS.workflowRun.fields.workflowVersion.universalIdentifier,
    ],
    workflowIdIndex: [
      STANDARD_OBJECTS.workflowRun.fields.workflow.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.workflowRun.fields.searchVector.universalIdentifier,
    ],
  },
  workflowVersion: {
    workflowIdIndex: [
      STANDARD_OBJECTS.workflowVersion.fields.workflow.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.workflowVersion.fields.searchVector.universalIdentifier,
    ],
  },
  workspaceMember: {
    userEmailUniqueIndex: [
      STANDARD_OBJECTS.workspaceMember.fields.userEmail.universalIdentifier,
    ],
    searchVectorGinIndex: [
      STANDARD_OBJECTS.workspaceMember.fields.searchVector.universalIdentifier,
    ],
  },
};
