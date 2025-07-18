import { Module, OnModuleInit } from '@nestjs/common';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';

import { ToolRegistryService } from './tool-registry.service';

import { HttpTool } from './tools/http-tool/http-tool';

@Module({
  providers: [ToolRegistryService, HttpTool],
  exports: [ToolRegistryService],
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
