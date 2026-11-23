import { getMarketplaceAppConnectLink } from '@/marketplace/utils/getMarketplaceAppConnectLink';

describe('getMarketplaceAppConnectLink', () => {
  it('should fill in the MCP server URL, encoded', () => {
    expect(
      getMarketplaceAppConnectLink({
        connectUrl:
          'https://claude.ai/customize/connectors?connectorUrl={mcpServerUrl}',
        serverBaseUrl: 'https://crm.example.com/',
      }),
    ).toBe(
      'https://claude.ai/customize/connectors?connectorUrl=https%3A%2F%2Fcrm.example.com%2Fmcp',
    );
  });

  it('should leave a link without placeholder as it is', () => {
    expect(
      getMarketplaceAppConnectLink({
        connectUrl: 'https://docs.twenty.com/developers',
        serverBaseUrl: 'https://crm.example.com',
      }),
    ).toBe('https://docs.twenty.com/developers');
  });
});
