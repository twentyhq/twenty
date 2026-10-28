import { AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import { getMcpServerMentionSearchResults } from '@/ai/utils/getMcpServerMentionSearchResults';

const MCP_SERVERS = [
  { id: 'slack-id', name: 'slack', label: 'Slack' },
  { id: 'github-id', name: 'github', label: 'GitHub' },
];

const search = (query: string) =>
  getMcpServerMentionSearchResults({
    mcpServers: MCP_SERVERS,
    query,
    objectLabelSingular: 'MCP server',
    objectLabelPlural: 'MCP servers',
  });

describe('getMcpServerMentionSearchResults', () => {
  it('should list every server sorted by label for an empty query', () => {
    expect(search('').map(({ label }) => label)).toEqual(['GitHub', 'Slack']);
  });

  it('should match the label or the name regardless of case', () => {
    expect(search('GIT').map(({ recordId }) => recordId)).toEqual([
      'github-id',
    ]);
  });

  it('should map a server to an MCP server mention', () => {
    expect(search('slack')).toEqual([
      {
        recordId: 'slack-id',
        objectNameSingular: AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR,
        objectLabelSingular: 'MCP server',
        objectLabelPlural: 'MCP servers',
        label: 'Slack',
        imageUrl: '',
      },
    ]);
  });
});
