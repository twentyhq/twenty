import { Module } from '@nestjs/common';

import { McpMetadataController } from './controllers/mcp-metadata.controller';
import { AiModule } from 'src/engine/core-modules/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [McpMetadataController],
  exports: [],
  providers: [],
})
export class McpModule {}
