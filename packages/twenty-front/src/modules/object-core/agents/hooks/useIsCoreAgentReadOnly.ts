import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';

export const useIsCoreAgentReadOnly = (agent: {
  applicationId?: string | null;
}) => {
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  return !getIsMetadataItemCustom(agent);
};
