import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import {
  FeatureFlagKey,
  FindManyMcpServersDocument,
} from '~/generated-metadata/graphql';

export const useFindManyMcpServers = () => {
  const isMcpServersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
  );

  const { data, loading, error } = useQuery(FindManyMcpServersDocument, {
    skip: !isMcpServersEnabled,
  });

  return { mcpServers: data?.mcpServers ?? [], loading, error };
};
