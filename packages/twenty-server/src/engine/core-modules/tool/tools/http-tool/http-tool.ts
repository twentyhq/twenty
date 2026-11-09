import { Injectable } from '@nestjs/common';

import { HttpEgressService } from 'src/engine/core-modules/http-egress/http-egress.service';
import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  inputSchema = HttpRequestInputZodSchema;

  constructor(private readonly httpEgressService: HttpEgressService) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    return this.httpEgressService.execute(parameters, context);
  }
}
