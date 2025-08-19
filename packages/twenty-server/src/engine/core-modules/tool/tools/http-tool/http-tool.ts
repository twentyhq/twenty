import { Injectable } from '@nestjs/common';

import axios, { type AxiosRequestConfig } from 'axios';

import { HttpToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { WorkflowVersionStepHttpRequestTestService } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/workflow-version-step-http-request-test.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

@Injectable()
export class HttpTool implements Tool {
  constructor(
    private readonly workflowVersionStepHttpRequestTestService: WorkflowVersionStepHttpRequestTestService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  parameters = HttpToolParametersZodSchema;

  async execute(parameters: ToolInput): Promise<ToolOutput> {
    const { url, method, headers, body, bodyType } =
      parameters as HttpRequestInput;

    const isMethodForBody = ['POST', 'PUT', 'PATCH'].includes(method);

    try {
      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers,
      };

      if (bodyType === 'FormData' && isMethodForBody) {
        const { workspaceId } = this.scopedWorkspaceContextFactory.create();

        if (!workspaceId) {
          throw new Error('workspace not found');
        }
        const formData =
          await this.workflowVersionStepHttpRequestTestService.getFormDataValues(
            { workspaceId, input: { url, method, headers, body, bodyType } },
          );

        if (formData) {
          axiosConfig.data = formData;
          if (
            axiosConfig?.headers?.['Content-Type'] ||
            axiosConfig?.headers?.['content-type']
          ) {
            delete axiosConfig?.headers['Content-Type'];
            delete axiosConfig?.headers['content-type'];
          }
          axiosConfig.headers = {
            ...headers,
            ...formData?.getHeaders(),
          };
        }
      } else if (isMethodForBody && body) {
        axiosConfig.data = body;
      }

      const response = await axios(axiosConfig);

      return { result: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data || error.message || 'HTTP request failed',
        };
      }

      return {
        error: error instanceof Error ? error.message : 'HTTP request failed',
      };
    }
  }
}
