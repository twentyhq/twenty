import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';

import { getMcpServerMentionSearchResults } from '@/ai/utils/getMcpServerMentionSearchResults';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FindActiveMcpServersForMentionDocument,
} from '~/generated-metadata/graphql';

export const useMcpServerMentionSearch = () => {
  const apolloMetadataClient = useApolloClient();
  const isMcpServersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
  );

  const searchMcpServers = useCallback(
    async (query: string): Promise<MentionSearchResult[]> => {
      if (!isMcpServersEnabled) {
        return [];
      }

      const { data } = await apolloMetadataClient.query({
        query: FindActiveMcpServersForMentionDocument,
        fetchPolicy: isNonEmptyString(query) ? 'cache-first' : 'network-only',
      });

      return getMcpServerMentionSearchResults({
        mcpServers: data?.activeMcpServers ?? [],
        query,
        objectLabelSingular: t`MCP server`,
        objectLabelPlural: t`MCP servers`,
      });
    },
    [apolloMetadataClient, isMcpServersEnabled],
  );

  return { searchMcpServers };
};
