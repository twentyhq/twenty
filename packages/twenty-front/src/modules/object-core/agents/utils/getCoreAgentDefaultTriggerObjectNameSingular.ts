import { type AgentTrigger } from 'twenty-shared/application';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';

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
        ? [splitWorkflowTriggerEventName(trigger.settings.eventName).objectType]
        : [],
    )
    .find((objectNameSingular) =>
      objectNameSingulars.includes(objectNameSingular),
    );

  return (
    existingObjectNameSingular ??
    objectNameSingulars.find(
      (objectNameSingular) =>
        objectNameSingular === StandardObjectNameSingular.Person,
    ) ??
    objectNameSingulars.at(0) ??
    StandardObjectNameSingular.Person
  );
};
