import { computePackageJsonChecksum } from 'twenty-shared/application';
import { v5 } from 'uuid';

import { BUNDLED_MCP_SERVER_APPLICATION_CATEGORY } from 'src/engine/core-modules/application/application-bundled/mcp-servers/constants/bundled-mcp-server-application-category.constant';
import { type BundledMcpServer } from 'src/engine/core-modules/application/application-bundled/mcp-servers/types/bundled-mcp-server.type';
import { buildBundledApplicationPackageJson } from 'src/engine/core-modules/application/application-bundled/utils/build-bundled-application-package-json.util';
import { type BundledApplication } from 'src/engine/core-modules/application/application-bundled/types/bundled-application.type';

export const buildMcpServerBundledApplication = (
  mcpServer: BundledMcpServer,
): BundledApplication => {
  // Stable across servers and versions, so an upgrade updates entities instead of recreating them
  const deriveUniversalIdentifier = (entityName: string) =>
    v5(entityName, mcpServer.universalIdentifier);

  const roleUniversalIdentifier = deriveUniversalIdentifier('role');
  const connectionProviderUniversalIdentifier = deriveUniversalIdentifier(
    'connection-provider',
  );

  return {
    version: mcpServer.version,
    manifest: {
      application: {
        universalIdentifier: mcpServer.universalIdentifier,
        displayName: mcpServer.label,
        description: mcpServer.description,
        aboutDescription:
          mcpServer.aboutDescription ??
          `Add the ${mcpServer.label} MCP server so your agents and workflows can use its tools.`,
        author: mcpServer.author,
        category: BUNDLED_MCP_SERVER_APPLICATION_CATEGORY,
        logo: mcpServer.logoUrl ?? undefined,
        websiteUrl: mcpServer.websiteUrl,
        defaultRoleUniversalIdentifier: roleUniversalIdentifier,
        packageJsonChecksum: computePackageJsonChecksum(
          JSON.stringify(
            buildBundledApplicationPackageJson({
              universalIdentifier: mcpServer.universalIdentifier,
              version: mcpServer.version,
            }),
          ),
        ),
        yarnLockChecksum: null,
      },
      roles: [
        {
          universalIdentifier: roleUniversalIdentifier,
          label: `${mcpServer.label} role`,
          description: `${mcpServer.label} runs no code in the workspace and reads no records`,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canUpdateAllSettings: false,
          canBeAssignedToAgents: false,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
          objectPermissions: [],
          fieldPermissions: [],
        },
      ],
      connectionProviders: [
        {
          universalIdentifier: connectionProviderUniversalIdentifier,
          name: `mcp-${mcpServer.name.replace(/_/g, '-')}`,
          displayName: mcpServer.label,
          type: 'oauth-discovery',
          scope: 'USER',
          oauthDiscovery: { resourceUrl: mcpServer.url },
        },
      ],
      mcpServers: [
        {
          universalIdentifier: deriveUniversalIdentifier('mcp-server'),
          name: mcpServer.name,
          label: mcpServer.label,
          url: mcpServer.url,
          connectionProvider: {
            universalIdentifier: connectionProviderUniversalIdentifier,
          },
        },
      ],
      objects: [],
      fields: [],
      logicFunctions: [],
      frontComponents: [],
      permissionFlags: [],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [],
      viewFields: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
      pageLayoutWidgets: [],
      commandMenuItems: [],
      timelineActivityTypes: [],
      settingsMenuItems: [],
    },
  };
};
