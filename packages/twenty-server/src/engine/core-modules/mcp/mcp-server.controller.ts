import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MCPServerService, MCPRequest, MCPResponse } from './mcp-server.service';

@Controller('mcp')
export class MCPServerController {
  constructor(private readonly mcpService: MCPServerService) {}

  @Get('servers')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user: { workspaceId: string } }) {
    return this.mcpService.findByWorkspace(req.user.workspaceId);
  }

  @Get('servers/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.mcpService.findOne(id, req.user.workspaceId);
  }

  @Post('servers')
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() data: { name: string; description?: string },
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.mcpService.createServer(req.user.workspaceId, data);
  }

  @Put('servers/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.mcpService.updateServer(id, req.user.workspaceId, data);
  }

  @Delete('servers/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.mcpService.deleteServer(id, req.user.workspaceId);
  }

  @Post('servers/:id/regenerate-key')
  @UseGuards(AuthGuard('jwt'))
  async regenerateKey(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    const newApiKey = await this.mcpService.regenerateApiKey(id, req.user.workspaceId);
    return { apiKey: newApiKey };
  }

  @Post('execute/:serverId')
  async execute(
    @Param('serverId') serverId: string,
    @Headers('x-api-key') apiKey: string,
    @Body() request: MCPRequest,
  ): Promise<MCPResponse> {
    return this.mcpService.executeRequest(serverId, {
      ...request,
      apiKey,
      serverId,
    });
  }
}
