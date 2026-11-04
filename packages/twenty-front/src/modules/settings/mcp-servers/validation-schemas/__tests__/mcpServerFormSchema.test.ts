import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

describe('getMcpServerFormSchema', () => {
  const validInput: McpServerFormValues = {
    label: 'Linear',
    name: 'linear_tools',
    url: 'https://mcp.linear.app/mcp',
    connectionProviderId: null,
    isActive: true,
  };

  it('accepts a valid input', () => {
    expect(getMcpServerFormSchema().safeParse(validInput).success).toBe(true);
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

  it.each([
    ['empty label', { label: '' }, 'Label is required'],
    ['empty name', { name: '' }, 'Name is required'],
    [
      'name starting with a digit',
      { name: '1linear' },
      'Use lowercase letters, digits and underscores, starting with a letter',
    ],
    [
      'name with uppercase letters',
      { name: 'Linear' },
      'Use lowercase letters, digits and underscores, starting with a letter',
    ],
    [
      'name with dashes',
      { name: 'linear-tools' },
      'Use lowercase letters, digits and underscores, starting with a letter',
    ],
    [
      'name longer than 32 characters',
      { name: 'a'.repeat(33) },
      'Name must be at most 32 characters',
    ],
    ['empty url', { url: '' }, 'URL is required'],
    ['non http url', { url: 'ftp://mcp.example.com' }, 'Please enter a valid http(s) URL'],
    ['malformed url', { url: 'https://' }, 'Please enter a valid http(s) URL'],
  ])('rejects %s', (_title, overrides, expectedMessage) => {
    const result = getMcpServerFormSchema().safeParse({
      ...validInput,
      ...overrides,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      expectedMessage,
    );
  });
});
