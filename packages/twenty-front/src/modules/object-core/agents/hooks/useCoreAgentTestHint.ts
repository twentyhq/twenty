import { useGetCoreAgentTriggerDescription } from '@/object-core/agents/hooks/useGetCoreAgentTriggerDescription';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentTestHint } from '@/object-core/agents/utils/getCoreAgentTestHint';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const useCoreAgentTestHint = (agent: Pick<CoreAgent, 'triggers'>) => {
  const { getCoreAgentTriggerDescription } =
    useGetCoreAgentTriggerDescription();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  return getCoreAgentTestHint({
    triggers: agent.triggers,
    getTriggerDetails: getCoreAgentTriggerDescription,
    getObjectLabelSingular: (objectNameSingular) =>
      objectMetadataItems.find(
        ({ nameSingular }) => nameSingular === objectNameSingular,
      )?.labelSingular,
  });
};
