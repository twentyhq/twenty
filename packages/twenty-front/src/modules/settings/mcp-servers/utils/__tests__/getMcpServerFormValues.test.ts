import { getMcpServerFormValues } from '@/settings/mcp-servers/utils/getMcpServerFormValues';

describe('getMcpServerFormValues', () => {
  it('keeps the editable fields of the server', () => {
    expect(
      getMcpServerFormValues({
        label: 'Linear',
        name: 'linear',
        url: 'https://mcp.linear.app/mcp',
        connectionProviderId: '20202020-0000-4000-8000-000000000001',
        isActive: false,
      }),
    ).toEqual({
      label: 'Linear',
      name: 'linear',
      url: 'https://mcp.linear.app/mcp',
      connectionProviderId: '20202020-0000-4000-8000-000000000001',
      isActive: false,
    });
  });
});
