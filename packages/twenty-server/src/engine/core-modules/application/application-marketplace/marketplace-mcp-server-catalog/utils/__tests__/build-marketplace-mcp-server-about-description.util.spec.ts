import { buildMarketplaceMcpServerAboutDescription } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/build-marketplace-mcp-server-about-description.util';

const linear = {
  label: 'Linear',
  author: 'Linear',
  url: 'https://mcp.linear.app/mcp',
  aboutDescription: null,
  toolNames: [],
  isReadOnly: null,
};

describe('buildMarketplaceMcpServerAboutDescription', () => {
  it('should say where tools run when nothing else is known', () => {
    expect(buildMarketplaceMcpServerAboutDescription(linear)).toBe(
      "Add the Linear MCP server so your agents and workflows can use its tools.\n\nTools run on Linear's server at https://mcp.linear.app/mcp: agents send it the data each call needs.",
    );
  });

  it('should list the tools and say whether they write', () => {
    const aboutDescription = buildMarketplaceMcpServerAboutDescription({
      ...linear,
      aboutDescription: 'Manage issues in Linear.',
      toolNames: ['list_issues', 'create_issue'],
      isReadOnly: false,
    });

    expect(aboutDescription).toContain('Manage issues in Linear.');
    expect(aboutDescription).toContain('Its tools read and write data.');
    expect(aboutDescription).toContain(
      '### Tools (2)\n\n- `list_issues`\n- `create_issue`',
    );
  });
});
