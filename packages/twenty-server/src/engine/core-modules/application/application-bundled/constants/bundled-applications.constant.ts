import { BUNDLED_MCP_SERVERS } from 'src/engine/core-modules/application/application-bundled/mcp-servers/constants/bundled-mcp-servers.constant';
import { buildMcpServerBundledApplication } from 'src/engine/core-modules/application/application-bundled/mcp-servers/utils/build-mcp-server-bundled-application.util';
import { type BundledApplication } from 'src/engine/core-modules/application/application-bundled/types/bundled-application.type';

export const BUNDLED_APPLICATIONS: BundledApplication[] =
  BUNDLED_MCP_SERVERS.map(buildMcpServerBundledApplication);
