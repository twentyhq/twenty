import * as eventSchemas from './events';
import { pageviewSchema } from './events';

const makeEvent = (data: unknown) => {
  const baseValidation = eventSchemas.eventSchema.safeParse(data);

  if (baseValidation.success) {
    const action = baseValidation.data.action;

    // Create a mapping from action to schema name
    const actionToSchemaName: Record<string, string> = {
      'apiKey.created': 'apiKeyCreatedSchema',
      'attachment.created': 'attachmentCreatedSchema',
      'auditLog.created': 'auditLogCreatedSchema',
      'blocklist.created': 'blocklistCreatedSchema',
      'calendarChannel.created': 'calendarChannelCreatedSchema',
      'calendarChannelEventAssociation.created':
        'calendarChannelEventAssociationCreatedSchema',
      'calendarEvent.created': 'calendarEventCreatedSchema',
      'calendarEventParticipant.created':
        'calendarEventParticipantCreatedSchema',
      'company.created': 'companyCreatedSchema',
      'connectedAccount.created': 'connectedAccountCreatedSchema',
      'favorite.created': 'favoriteCreatedSchema',
      'function.execute': 'functionExecuteSchema',
      'message.created': 'messageCreatedSchema',
      'messageChannel.created': 'messageChannelCreatedSchema',
      'messageChannelMessageAssociation.created':
        'messageChannelMessageAssociationCreatedSchema',
      'messageParticipant.created': 'messageParticipantCreatedSchema',
      'messageThread.created': 'messageThreadCreatedSchema',
      'note.created': 'noteCreatedSchema',
      'noteTarget.created': 'noteTargetCreatedSchema',
      'opportunity.created': 'opportunityCreatedSchema',
      'person.created': 'personCreatedSchema',
      'serverlessFunction.executed': 'serverlessFunctionExecutedSchema',
      'task.created': 'taskCreatedSchema',
      'taskTarget.created': 'taskTargetCreatedSchema',
      'timelineActivity.created': 'timelineActivityCreatedSchema',
      'view.created': 'viewCreatedSchema',
      'viewField.created': 'viewFieldCreatedSchema',
      'viewFilter.created': 'viewFilterCreatedSchema',
      'viewSort.created': 'viewSortCreatedSchema',
      'webhook.created': 'webhookCreatedSchema',
      'webhook.response': 'webhookResponseSchema',
      'workspaceMember.created': 'workspaceMemberCreatedSchema',
    };

    const schemaName = actionToSchemaName[action];

    if (schemaName && schemaName in eventSchemas) {
      return (eventSchemas as any)[schemaName].parse(data);
    }

    return baseValidation.data;
  }

  throw new Error('Invalid event data');
};

const makePageview = (data: unknown) => {
  return pageviewSchema.parse(data);
};

export { makeEvent, makePageview };
export type {};
