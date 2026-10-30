import { type AgentTrigger } from 'twenty-shared/application';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getCoreAgentDefaultTriggerObjectNameSingular = ({
  triggers,
  objectNameSingulars,
}: {
  triggers: AgentTrigger[];
  objectNameSingulars: string[];
}): string => {
  const existingObjectNameSingular = triggers
    .flatMap((trigger) =>
      trigger.type === 'DATABASE_EVENT'
        ? [trigger.settings.eventName.split('.')[0]]
        : [],
    )
    .at(0);

  return (
    existingObjectNameSingular ??
    objectNameSingulars.find(
      (objectNameSingular) =>
        objectNameSingular === CoreObjectNameSingular.Person,
    ) ??
    objectNameSingulars.at(0) ??
    CoreObjectNameSingular.Person
  );
};
