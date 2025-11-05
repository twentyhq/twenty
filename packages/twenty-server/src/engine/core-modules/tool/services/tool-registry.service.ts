import { Injectable } from '@nestjs/common';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type SendEmailInput } from 'src/engine/core-modules/tool/tools/send-email-tool/types/send-email-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@Injectable()
export class ToolRegistryService {
  private readonly toolFactories: Map<ToolType, () => Tool>;

  constructor(
    private readonly sendEmailTool: SendEmailTool,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.toolFactories = new Map<ToolType, () => Tool>([
      [ToolType.HTTP_REQUEST, () => new HttpTool(twentyConfigService)],
      [
        ToolType.SEND_EMAIL,
        () => ({
          description: this.sendEmailTool.description,
          inputSchema: this.sendEmailTool.inputSchema,
          execute: (params) =>
            this.sendEmailTool.execute(params as SendEmailInput),
          flag: PermissionFlagType.SEND_EMAIL_TOOL,
        }),
      ],
    ]);
  }

  getTool(toolType: ToolType): Tool {
    const factory = this.toolFactories.get(toolType);

    if (!factory) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    return factory();
  }

  getAllToolTypes(): ToolType[] {
    return Array.from(this.toolFactories.keys());
  }
}
