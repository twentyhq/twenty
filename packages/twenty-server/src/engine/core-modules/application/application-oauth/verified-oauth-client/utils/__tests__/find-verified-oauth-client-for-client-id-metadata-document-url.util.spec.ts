import { MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listing-universal-identifiers.constant';
import { findVerifiedOAuthClientForClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-client-id-metadata-document-url.util';

describe('findVerifiedOAuthClientForClientIdMetadataDocumentUrl', () => {
  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata',
  ])('should give %s the Claude identifier', (clientId) => {
    expect(
      findVerifiedOAuthClientForClientIdMetadataDocumentUrl(clientId)
        ?.universalIdentifier,
    ).toBe(MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.CLAUDE);
  });

  it.each([
    'https://claude.ai/oauth/another-client-metadata',
    '20202020-82da-4d5a-afd2-53c52090f5e1',
  ])('should find nothing for %s', (clientId) => {
    expect(
      findVerifiedOAuthClientForClientIdMetadataDocumentUrl(clientId),
    ).toBeUndefined();
  });
});
