import { AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { normalizeSearchText } from 'twenty-ui/utilities';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export const getMcpServerMentionSearchResults = ({
  mcpServers,
  query,
  objectLabelSingular,
  objectLabelPlural,
}: {
  mcpServers: { id: string; name: string; label: string }[];
  query: string;
  objectLabelSingular: string;
  objectLabelPlural: string;
}): MentionSearchResult[] => {
  const normalizedQuery = normalizeSearchText(query.trim());

  return mcpServers
    .filter(
      (mcpServer) =>
        normalizeSearchText(mcpServer.name).includes(normalizedQuery) ||
        normalizeSearchText(mcpServer.label).includes(normalizedQuery),
    )
    .sort((mcpServerA, mcpServerB) =>
      mcpServerA.label.localeCompare(mcpServerB.label),
    )
    .map((mcpServer) => ({
      recordId: mcpServer.id,
      objectNameSingular: AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR,
      objectLabelSingular,
      objectLabelPlural,
      label: mcpServer.label,
      imageUrl: '',
    }));
};
