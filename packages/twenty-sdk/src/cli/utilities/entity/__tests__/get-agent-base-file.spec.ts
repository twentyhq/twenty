import { getAgentBaseFile } from '@/cli/utilities/entity/entity-agent-template';

describe('getAgentBaseFile', () => {
  it('should render proper file using defineAgent', () => {
    const result = getAgentBaseFile({
      name: 'my-agent',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    expect(result).toContain(
      "import { defineAgent } from 'twenty-sdk/define';",
    );
    expect(result).toContain('export default defineAgent({');
    expect(result).toContain(
      'universalIdentifier: MY_AGENT_AGENT_UNIVERSAL_IDENTIFIER',
    );
    expect(result).toContain("'71e45a58-41da-4ae4-8b73-a543c0a9d3d4'");
    expect(result).toContain("name: 'my-agent'");
    expect(result).toContain("label: 'my-agent'");
    expect(result).toContain("description: 'Add a description for your agent'");
    expect(result).toContain("prompt: 'Add the agent system prompt here'");
  });

  it('should generate unique UUID when not provided', () => {
    const result = getAgentBaseFile({
      name: 'auto-uuid-agent',
    });

    expect(result).toMatch(
      /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should export universal identifier constant with correct naming', () => {
    const result = getAgentBaseFile({
      name: 'data-sync',
    });

    expect(result).toContain(
      'export const DATA_SYNC_AGENT_UNIVERSAL_IDENTIFIER',
    );
    expect(result).toContain(
      'universalIdentifier: DATA_SYNC_AGENT_UNIVERSAL_IDENTIFIER',
    );
  });

  it('should use kebab-case for name in template', () => {
    const result = getAgentBaseFile({
      name: 'my-awesome-agent',
    });

    expect(result).toContain("name: 'my-awesome-agent'");
    expect(result).toContain("label: 'my-awesome-agent'");
  });
});
