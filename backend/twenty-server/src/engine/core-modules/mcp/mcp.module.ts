import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MCPServerEntity } from './mcp-server.entity';
import { MCPServerService } from './mcp-server.service';
import { MCPServerController } from './mcp-server.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MCPServerEntity])],
  controllers: [MCPServerController],
  providers: [MCPServerService],
  exports: [MCPServerService],
})
export class MCPModule {}