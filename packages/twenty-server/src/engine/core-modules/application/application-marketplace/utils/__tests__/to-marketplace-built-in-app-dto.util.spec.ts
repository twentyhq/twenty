import { toMarketplaceBuiltInAppDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-built-in-app-dto.util';

describe('toMarketplaceBuiltInAppDTO', () => {
  it('should build a listed card with a logo served by the front end', () => {
    expect(
      toMarketplaceBuiltInAppDTO({
        builtInApplication: {
          universalIdentifier: '20202020-b759-4b27-9593-4d075aea79ed',
          name: 'Claude',
          description: 'Short description',
          author: 'Anthropic',
          category: 'Productivity',
          logoPath: '/images/oauth-clients/claude.webp',
          connectUrl: 'https://claude.ai/connect?url={mcpServerUrl}',
        },
        frontBaseUrl: new URL('https://app.example.com'),
      }),
    ).toEqual({
      id: '20202020-b759-4b27-9593-4d075aea79ed',
      name: 'Claude',
      description: 'Short description',
      author: 'Anthropic',
      category: 'Productivity',
      logoUrl: 'https://app.example.com/images/oauth-clients/claude.webp',
      connectUrl: 'https://claude.ai/connect?url={mcpServerUrl}',
      isListed: true,
    });
  });
});
