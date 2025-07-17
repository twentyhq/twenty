import { Module, OnModuleInit } from '@nestjs/common';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';

import { ToolRegistryService, ToolType } from './tool-registry.service';

import { HttpTool } from './tools/http-tool/http-tool';

@Module({
  providers: [ToolRegistryService, HttpTool, ToolAdapterService],
  exports: [ToolRegistryService, ToolAdapterService],
})
export class ToolModule implements OnModuleInit {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  onModuleInit() {
    this.toolRegistryService.registerTool(
      ToolType.HTTP_REQUEST,
      new HttpTool(),
    );
  }
}
