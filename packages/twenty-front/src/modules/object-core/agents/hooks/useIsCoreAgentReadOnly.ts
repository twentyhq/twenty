import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';

export const useIsCoreAgentReadOnly = (
  agent: Partial<Pick<CoreAgent, 'applicationId'>>,
) => {
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  return !getIsMetadataItemCustom(agent);
};
