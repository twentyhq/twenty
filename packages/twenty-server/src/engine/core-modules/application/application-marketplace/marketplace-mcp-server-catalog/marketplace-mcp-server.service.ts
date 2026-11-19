import { Injectable } from '@nestjs/common';

import { getUrlSafely, isDefined } from 'twenty-shared/utils';

import { findAvailableMcpServerName } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/find-available-mcp-server-name.util';
import { findMarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/find-marketplace-mcp-server.util';
import { type McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';

@Injectable()
export class MarketplaceMcpServerService {
  constructor(private readonly mcpServerService: McpServerService) {}

  async addToWorkspace({
    universalIdentifier,
    workspaceId,
    userWorkspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<McpServerDTO> {
    const marketplaceMcpServer = findMarketplaceMcpServer(universalIdentifier);

    if (!isDefined(marketplaceMcpServer)) {
      throw new McpServerException(
        `No marketplace MCP server found for identifier "${universalIdentifier}"`,
        McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
      );
    }

    const mcpServers = await this.mcpServerService.findAll(workspaceId);
    const marketplaceUrl = getUrlSafely(marketplaceMcpServer.url)?.toString();
    const existingMcpServer =
      mcpServers.find(
        (mcpServer) =>
          mcpServer.universalIdentifier ===
          marketplaceMcpServer.universalIdentifier,
      ) ??
      mcpServers.find(
        (mcpServer) =>
          getUrlSafely(mcpServer.url)?.toString() === marketplaceUrl,
      );

    if (isDefined(existingMcpServer)) {
      return existingMcpServer;
    }

    return this.mcpServerService.create({
      input: {
        name: findAvailableMcpServerName({
          name: marketplaceMcpServer.name,
          takenNames: mcpServers.map((mcpServer) => mcpServer.name),
        }),
        label: marketplaceMcpServer.label,
        url: marketplaceMcpServer.url,
      },
      workspaceId,
      userWorkspaceId,
      universalIdentifier: marketplaceMcpServer.universalIdentifier,
    });
  }
}
