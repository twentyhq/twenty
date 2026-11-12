import { resolveMcpToolTestArguments } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/resolveMcpToolTestArguments';

describe('resolveMcpToolTestArguments', () => {
  it('fills the variables from their test values without touching the saved input', () => {
    const toolInput = {
      query: '{{trigger.properties.after.name}}',
      limit: 5,
      tags: ['{{trigger.properties.after.name}}'],
    };

    const toolArguments = resolveMcpToolTestArguments({
      toolInput,
      variableValues: { 'trigger.properties.after.name': 'Acme' },
    });

    expect(toolArguments).toEqual({ query: 'Acme', limit: 5, tags: ['Acme'] });
    expect(toolInput.tags).toEqual(['{{trigger.properties.after.name}}']);
  });
});
