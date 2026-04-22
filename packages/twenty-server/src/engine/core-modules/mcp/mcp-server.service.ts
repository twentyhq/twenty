import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MCPServerEntity, MCPServerStatus } from './mcp-server.entity';

export interface MCPRequest {
  serverId: string;
  apiKey: string;
  method: string;
  object: string;
  data?: Record<string, unknown>;
  filters?: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

@Injectable()
export class MCPServerService {
  constructor(
    @InjectRepository(MCPServerEntity)
    private readonly mcpRepo: Repository<MCPServerEntity>,
  ) {}

  async createServer(
    workspaceId: string,
    data: Partial<MCPServerEntity>,
  ): Promise<MCPServerEntity> {
    const server = this.mcpRepo.create({
      ...data,
      workspaceId,
      apiKey: this.generateApiKey(),
    });
    return this.mcpRepo.save(server);
  }

  async findByWorkspace(workspaceId: string): Promise<MCPServerEntity[]> {
    return this.mcpRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<MCPServerEntity> {
    const server = await this.mcpRepo.findOne({
      where: { id, workspaceId },
    });
    if (!server) {
      throw new NotFoundException(`MCP Server ${id} not found`);
    }
    return server;
  }

  async validateApiKey(serverId: string, apiKey: string): Promise<MCPServerEntity> {
    const server = await this.mcpRepo.findOne({
      where: { id: serverId, apiKey, status: MCPServerStatus.ACTIVE },
    });
    if (!server) {
      throw new ForbiddenException('Invalid API key or server inactive');
    }
    return server;
  }

  async updateServer(
    id: string,
    workspaceId: string,
    data: Partial<MCPServerEntity>,
  ): Promise<MCPServerEntity> {
    await this.mcpRepo.update({ id, workspaceId }, data);
    return this.findOne(id, workspaceId);
  }

  async deleteServer(id: string, workspaceId: string): Promise<void> {
    await this.mcpRepo.delete({ id, workspaceId });
  }

  async regenerateApiKey(id: string, workspaceId: string): Promise<string> {
    const newApiKey = this.generateApiKey();
    await this.mcpRepo.update({ id, workspaceId }, { apiKey: newApiKey });
    return newApiKey;
  }

  async recordUsage(serverId: string): Promise<void> {
    await this.mcpRepo.increment({ id: serverId }, 'usageCount', 1);
    await this.mcpRepo.update({ id: serverId }, { lastUsedAt: new Date() });
  }

  async executeRequest(serverId: string, request: MCPRequest): Promise<MCPResponse> {
    const server = await this.validateApiKey(serverId, request.apiKey);
    
    if (!server.allowedObjects?.includes(request.object) && server.allowedObjects?.length > 0) {
      throw new ForbiddenException(`Object ${request.object} not allowed`);
    }

    if (!server.allowedOperations?.includes(request.method) && server.allowedOperations?.length > 0) {
      throw new ForbiddenException(`Method ${request.method} not allowed`);
    }

    await this.recordUsage(serverId);

    return {
      success: true,
      data: {
        object: request.object,
        method: request.method,
        executed: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'mcp_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}