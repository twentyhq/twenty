import { Inject, Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-max-payload-size-bytes.constant';
import { HTTP_TOOL_TIMEOUT_MS } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-timeout-ms.constant';
import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';
import { normalizeHttpRequestHeaderValues } from 'src/engine/core-modules/tool/tools/http-tool/utils/normalize-http-request-header-values.util';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  inputSchema = HttpRequestInputZodSchema;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly logicFunctionExecutionThrottleService: LogicFunctionExecutionThrottleService,
    private readonly featureFlagService: FeatureFlagService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const parsedInput = HttpRequestInputZodSchema.safeParse(
      normalizeHttpRequestHeaderValues(parameters),
    );

    if (!parsedInput.success) {
      return buildInvalidToolArgumentsOutput({
        toolName: 'http_request',
        error: parsedInput.error,
      });
    }

    const input = parsedInput.data;

    if (await this.isExecutionThrottled(context.workspaceId)) {
      return {
        success: false,
        message: `HTTP ${input.method} request to ${input.url} failed`,
        error:
          'Too many HTTP requests and logic function runs for this workspace. Try again shortly.',
      };
    }

    const request: HttpEgressRequest = {
      input,
      limits: {
        timeoutMs: HTTP_TOOL_TIMEOUT_MS,
        maxPayloadSizeBytes: HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES,
      },
      context: {
        workspaceId: context.workspaceId,
        source: context.outboundRequestSource ?? 'workflow-http',
        userId: context.userId,
        userWorkspaceId: context.userWorkspaceId,
        workspaceMemberId: context.workspaceMemberId,
        workflowRunId: context.workflowRunId,
        workflowStepId: context.workflowStepId,
      },
    };

    const isLogicFunctionRuntimeEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED,
        context.workspaceId,
      );

    const loggedRequest = {
      method: input.method,
      url: input.url,
      context: request.context,
    };

    this.secureHttpClientService.recordRequest(loggedRequest);

    const { toolOutput, outcomeDetails } = isLogicFunctionRuntimeEnabled
      ? await this.logicFunctionDriverFactory
          .getCurrentDriver()
          .executeHttpRequest(request)
      : await executeHttpEgressRequest(
          request,
          this.secureHttpClientService.getHttpClient(),
        );

    this.secureHttpClientService.recordRequestOutcome({
      ...loggedRequest,
      outcomeDetails,
    });

    return toolOutput;
  }

  private async isExecutionThrottled(workspaceId: string): Promise<boolean> {
    try {
      await this.logicFunctionExecutionThrottleService.throttleOrThrow(
        workspaceId,
      );

      return false;
    } catch (error) {
      if (
        error instanceof ThrottlerException &&
        error.code === ThrottlerExceptionCode.LIMIT_REACHED
      ) {
        return true;
      }

      throw error;
    }
  }
}
