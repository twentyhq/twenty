import { type AgentTrigger } from 'twenty-shared/application';

type DatabaseEventTrigger = Extract<AgentTrigger, { type: 'DATABASE_EVENT' }>;

export const updateCoreAgentDatabaseEvent = ({
  trigger,
  objectNameSingular,
  action,
}: {
  trigger: DatabaseEventTrigger;
  objectNameSingular: string;
  action: string;
}): DatabaseEventTrigger => {
  const eventName = `${objectNameSingular}.${action}`;
  const canKeepWatchedFields =
    action === 'updated' && eventName === trigger.settings.eventName;

  return {
    ...trigger,
    settings: {
      ...trigger.settings,
      eventName,
      updatedFields: canKeepWatchedFields
        ? trigger.settings.updatedFields
        : undefined,
    },
  };
};
