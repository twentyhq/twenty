import { type AgentTrigger } from 'twenty-shared/application';
import { CoreObjectNameSingular } from 'twenty-shared/types';

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
