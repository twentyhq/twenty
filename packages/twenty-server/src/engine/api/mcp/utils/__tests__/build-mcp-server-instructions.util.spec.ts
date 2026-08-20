import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';

describe('buildMcpServerInstructions', () => {
  it('should not mention workspace instructions when none are configured', () => {
    const instructions = buildMcpServerInstructions('companies, people');

    expect(instructions).not.toContain('## Workspace Instructions');
  });

  it('should not mention workspace instructions when they are blank', () => {
    const instructions = buildMcpServerInstructions(
      'companies, people',
      undefined,
      '   ',
    );

    expect(instructions).not.toContain('## Workspace Instructions');
  });

  it('should append plain text workspace instructions', () => {
    const instructions = buildMcpServerInstructions(
      'companies, people',
      undefined,
      'Always set an assignee and a due date on tasks.',
    );

    expect(instructions).toContain('## Workspace Instructions');
    expect(instructions).toContain(
      'Always set an assignee and a due date on tasks.',
    );
  });

  it('should render workspace instructions stored as a tiptap document to markdown', () => {
    const instructions = buildMcpServerInstructions(
      'companies, people',
      undefined,
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Never delete a company.' }],
          },
        ],
      }),
    );

    expect(instructions).toContain('Never delete a company.');
    expect(instructions).not.toContain('"type":"doc"');
  });

  it('should keep workspace instructions after the tool guidance', () => {
    const instructions = buildMcpServerInstructions(
      'companies, people',
      'dashboard-building',
      'Always set an assignee.',
    );

    expect(instructions.indexOf('## Workspace Instructions')).toBeGreaterThan(
      instructions.indexOf('Available skills: dashboard-building.'),
    );
  });
});
