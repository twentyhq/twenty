import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

describe('getMcpServerFormSchema', () => {
  const validInput: McpServerFormValues = {
    label: 'Linear',
    name: 'linear_tools',
    url: 'https://mcp.linear.app/mcp',
  };

  it.each([
    'http://localhost:3000/mcp',
    'http://mcp-server:3000/mcp',
    'http://[::1]:3000/mcp',
  ])('accepts the internal endpoint %s like the server does', (url) => {
    expect(
      getMcpServerFormSchema().safeParse({ ...validInput, url }).success,
    ).toBe(true);
  });

  it('trims label, name and url', () => {
    const result = getMcpServerFormSchema().safeParse({
      ...validInput,
      label: '  Linear ',
      name: ' linear ',
      url: ' https://mcp.linear.app ',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      label: 'Linear',
      name: 'linear',
      url: 'https://mcp.linear.app',
    });
  });
});
