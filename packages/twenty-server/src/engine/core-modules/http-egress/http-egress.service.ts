import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { HttpEgressAdmissionService } from 'src/engine/core-modules/http-egress/services/http-egress-admission.service';
import { type HttpEgressDiagnostics } from 'src/engine/core-modules/http-egress/types/http-egress-diagnostics.type';
import { type HttpEgressRejection } from 'src/engine/core-modules/http-egress/types/http-egress-rejection.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/http-egress/types/http-egress-response.type';
import { describeHttpEgressUrl } from 'src/engine/core-modules/http-egress/utils/describe-http-egress-url.util';
import { executeHttpEgressRequest } from 'src/engine/core-modules/http-egress/utils/execute-http-egress-request.util';
import { stringifyHttpRequestHeaderValues } from 'src/engine/core-modules/http-egress/utils/stringify-http-request-header-values.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type OutboundRequestSource } from 'src/engine/core-modules/secure-http-client/outbound-request-source.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-max-payload-size-bytes.constant';
import { HTTP_TOOL_TIMEOUT_MS } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-timeout-ms.constant';
import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const RATE_LIMIT_SCOPE_LABELS: Record<
  Exclude<HttpEgressRejection['reason'], 'suspended' | 'concurrency'>,
  string
> = {
  'test-user-rate': 'test requests per user',
  'test-workspace-rate': 'test requests per workspace',
  'agent-user-rate': 'AI agent requests per user',
  'workspace-rate': 'requests per workspace',
  'trial-workspace-rate': 'requests per trial workspace',
};

const buildRejectionErrorMessage = ({
  reason,
  retryAfterMs,
}: HttpEgressRejection): string => {
  switch (reason) {
    case 'suspended':
      return 'HTTP requests are paused for this workspace after repeated requests to internal addresses. They resume automatically within 24 hours.';
    case 'concurrency':
      return 'Too many HTTP requests are running for this workspace. Try again in a few seconds.';
    default: {
      const retryAfterSeconds = Math.ceil((retryAfterMs ?? 0) / 1_000);

      return `HTTP request limit reached (${RATE_LIMIT_SCOPE_LABELS[reason]}). Try again in ${retryAfterSeconds}s.`;
    }
  }
};

@Injectable()
export class HttpEgressService {
  private readonly logger = new Logger(HttpEgressService.name);

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly httpEgressAdmissionService: HttpEgressAdmissionService,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(
    rawInput: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const source = context.outboundRequestSource ?? 'agent-http-tool';
    const requestRef = v4();
    const parsedInput = HttpRequestInputZodSchema.safeParse(
      stringifyHttpRequestHeaderValues(rawInput),
    );

    if (!parsedInput.success) {
      return this.finish({
        rawInput,
        context,
        source,
        requestRef,
        response: {
          toolOutput: buildInvalidToolArgumentsOutput({
            toolName: 'http_request',
            error: parsedInput.error,
          }),
          diagnostics: { outcome: 'invalid_request', durationMs: 0 },
        },
      });
    }

    const input = parsedInput.data;
    const admission = await this.httpEgressAdmissionService.admit({
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      source,
      requestRef,
    });

    if (isDefined(admission.rejection) && admission.isEnforced) {
      return this.finish({
        rawInput,
        context,
        source,
        requestRef,
        rejection: admission.rejection,
        response: {
          toolOutput: {
            success: false,
            message: `HTTP ${input.method} request to ${input.url} failed`,
            error: buildRejectionErrorMessage(admission.rejection),
          },
          diagnostics: {
            outcome:
              admission.rejection.reason === 'suspended'
                ? 'suspended'
                : 'rate_limited',
            durationMs: 0,
          },
        },
      });
    }

    try {
      const response = await executeHttpEgressRequest(
        {
          input,
          limits: {
            timeoutMs: HTTP_TOOL_TIMEOUT_MS,
            maxPayloadSizeBytes: HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES,
          },
        },
        this.secureHttpClientService.getHttpClient(),
      );

      if (response.diagnostics.outcome === 'blocked') {
        await this.httpEgressAdmissionService.recordBlockedRequest(
          context.workspaceId,
        );
      }

      return this.finish({
        rawInput,
        context,
        source,
        requestRef,
        shadowRejection: admission.rejection ?? undefined,
        response,
      });
    } finally {
      await admission.release();
    }
  }

  private finish({
    rawInput,
    context,
    source,
    requestRef,
    rejection,
    shadowRejection,
    response,
  }: {
    rawInput: ToolInput;
    context: ToolExecutionContext;
    source: OutboundRequestSource;
    requestRef: string;
    rejection?: HttpEgressRejection;
    shadowRejection?: HttpEgressRejection;
    response: HttpEgressResponse;
  }): ToolOutput {
    this.logOutcome({
      rawInput,
      context,
      source,
      requestRef,
      rejection,
      shadowRejection,
      diagnostics: response.diagnostics,
    });

    void this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.HttpEgressRequest,
      attributes: { source, outcome: response.diagnostics.outcome },
      shouldStoreInCache: false,
    });

    return response.toolOutput;
  }

  private logOutcome({
    rawInput,
    context,
    source,
    requestRef,
    rejection,
    shadowRejection,
    diagnostics,
  }: {
    rawInput: ToolInput;
    context: ToolExecutionContext;
    source: OutboundRequestSource;
    requestRef: string;
    rejection?: HttpEgressRejection;
    shadowRejection?: HttpEgressRejection;
    diagnostics: HttpEgressDiagnostics;
  }): void {
    const logEntry = JSON.stringify({
      requestRef,
      source,
      workspaceId: context.workspaceId,
      userId: context.userId,
      userWorkspaceId: context.userWorkspaceId,
      workflowRunId: context.workflowRunId,
      agentId: context.agentId,
      threadId: context.threadId,
      method: rawInput.method,
      ...describeHttpEgressUrl(rawInput.url),
      ...diagnostics,
      rejectedBy: rejection?.reason,
      wouldBeRejectedBy: shadowRejection?.reason,
    });

    if (
      diagnostics.outcome === 'success' ||
      diagnostics.outcome === 'http_error'
    ) {
      this.logger.log(`HTTP egress ${logEntry}`);

      return;
    }

    this.logger.warn(`HTTP egress ${logEntry}`);
  }
}
