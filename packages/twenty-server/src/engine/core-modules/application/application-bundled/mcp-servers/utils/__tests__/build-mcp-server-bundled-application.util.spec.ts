import { computePackageJsonChecksum } from 'twenty-shared/application';

import { type BundledMcpServer } from 'src/engine/core-modules/application/application-bundled/mcp-servers/types/bundled-mcp-server.type';
import { buildMcpServerBundledApplication } from 'src/engine/core-modules/application/application-bundled/mcp-servers/utils/build-mcp-server-bundled-application.util';
import { buildBundledApplicationPackageJson } from 'src/engine/core-modules/application/application-bundled/utils/build-bundled-application-package-json.util';

const STRIPE: BundledMcpServer = {
  registryName: 'com.stripe/mcp',
  universalIdentifier: 'a644881e-5d93-5819-9fa8-4a50f846f968',
  version: '1.0.0',
  name: 'stripe',
  label: 'Stripe',
  author: 'Stripe',
  description: 'Payment processing and financial infrastructure tools',
  aboutDescription: null,
  websiteUrl: 'https://stripe.com',
  logoUrl: 'https://twenty-icons.com/stripe.com',
  url: 'https://mcp.stripe.com',
};

describe('buildMcpServerBundledApplication', () => {
  it('should declare an MCP server that signs in through its own discovery provider', () => {
    const { version, manifest } = buildMcpServerBundledApplication(STRIPE);
    const [connectionProvider] = manifest.connectionProviders ?? [];
    const [mcpServer] = manifest.mcpServers ?? [];

    expect(version).toBe('1.0.0');
    expect(manifest.application).toMatchObject({
      universalIdentifier: STRIPE.universalIdentifier,
      displayName: 'Stripe',
      author: 'Stripe',
      logo: 'https://twenty-icons.com/stripe.com',
    });
    expect(connectionProvider).toMatchObject({
      type: 'oauth-discovery',
      oauthDiscovery: { resourceUrl: 'https://mcp.stripe.com' },
    });
    expect(mcpServer).toMatchObject({
      name: 'stripe',
      label: 'Stripe',
      url: 'https://mcp.stripe.com',
      connectionProvider: {
        universalIdentifier: connectionProvider.universalIdentifier,
      },
    });
  });

  it('should point the default role at a role the manifest declares', () => {
    const { manifest } = buildMcpServerBundledApplication(STRIPE);

    expect(manifest.roles.map((role) => role.universalIdentifier)).toEqual([
      manifest.application.defaultRoleUniversalIdentifier,
    ]);
  });

  it('should keep entity identifiers when the server changes', () => {
    const before = buildMcpServerBundledApplication(STRIPE).manifest;
    const after = buildMcpServerBundledApplication({
      ...STRIPE,
      version: '1.0.1',
      url: 'https://mcp.stripe.com/v2',
    }).manifest;

    expect(after.mcpServers?.[0].universalIdentifier).toBe(
      before.mcpServers?.[0].universalIdentifier,
    );
    expect(after.connectionProviders?.[0].universalIdentifier).toBe(
      before.connectionProviders?.[0].universalIdentifier,
    );
  });

  it('should give two servers different entity identifiers', () => {
    const stripe = buildMcpServerBundledApplication(STRIPE).manifest;
    const other = buildMcpServerBundledApplication({
      ...STRIPE,
      universalIdentifier: '70f9b83b-95e1-5a00-9c50-772e6d26848f',
    }).manifest;

    expect(other.mcpServers?.[0].universalIdentifier).not.toBe(
      stripe.mcpServers?.[0].universalIdentifier,
    );
  });

  it('should declare the checksum of the package.json the installer stores', () => {
    const { manifest } = buildMcpServerBundledApplication(STRIPE);

    expect(manifest.application.packageJsonChecksum).toBe(
      computePackageJsonChecksum(
        JSON.stringify(
          buildBundledApplicationPackageJson({
            universalIdentifier: STRIPE.universalIdentifier,
            version: STRIPE.version,
          }),
        ),
      ),
    );
  });
});
