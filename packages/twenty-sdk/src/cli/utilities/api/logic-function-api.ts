import { type ApiClient } from '@/cli/utilities/api/api-client';
import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { createClient } from 'graphql-sse';

export class LogicFunctionApi {
  constructor(private readonly apiClient: ApiClient) {}

  async findLogicFunctions(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        universalIdentifier: string;
        applicationId: string | null;
      }>
    >
  > {
    try {
      const query = `
        query FindManyLogicFunctions {
          findManyLogicFunctions {
            id
            name
            universalIdentifier
            applicationId
          }
        }
      `;

      const response = await this.apiClient.client.post(
        '/metadata',
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      if (response.data.errors) {
        return {
          success: false,
          error:
            response.data.errors[0]?.message || 'Failed to fetch functions',
        };
      }

      return {
        success: true,
        data: response.data.data.findManyLogicFunctions,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async executeLogicFunction({
    functionId,
    payload,
  }: {
    functionId: string;
    payload: Record<string, unknown>;
  }): Promise<
    ApiResponse<{
      data: unknown;
      logs: string;
      duration: number;
      status: string;
      error?: {
        errorType: string;
        errorMessage: string;
        stackTrace: string;
      };
    }>
  > {
    try {
      const mutation = `
        mutation ExecuteOneLogicFunction($input: ExecuteOneLogicFunctionInput!) {
          executeOneLogicFunction(input: $input) {
            data
            logs
            duration
            status
            error
          }
        }
      `;

      const variables = {
        input: {
          id: functionId,
          payload,
        },
      };

      const response = await this.apiClient.client.post(
        '/metadata',
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      if (response.data.errors) {
        return {
          success: false,
          error:
            response.data.errors[0]?.message ||
            'Failed to execute logic function',
        };
      }

      return {
        success: true,
        data: response.data.data.executeOneLogicFunction,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async subscribeToLogs({
    applicationUniversalIdentifier,
    functionUniversalIdentifier,
    functionName,
  }: {
    applicationUniversalIdentifier: string;
    functionUniversalIdentifier?: string;
    functionName?: string;
  }) {
    const twentyConfig = await this.apiClient.configService.getConfig();
    const baseUrl = this.apiClient.serverUrlOverride ?? twentyConfig.apiUrl;

    const wsClient = createClient({
      url: baseUrl + '/metadata',
      headers: async () => {
        const authToken = await this.apiClient.resolveAuthToken();

        return {
          Authorization: authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };
      },
    });

    const query = `
        subscription SubscribeToLogs($input: LogicFunctionLogsInput!) {
          logicFunctionLogs(input: $input) {
            logs
          }
        }
      `;

    const variables = {
      input: {
        applicationUniversalIdentifier,
        universalIdentifier: functionUniversalIdentifier,
        name: functionName,
      },
    };

    wsClient.subscribe<{ logicFunctionLogs: { logs: string } }>(
      {
        query,
        variables,
      },
      {
        next: ({ data }) => console.log(data?.logicFunctionLogs.logs),
        error: (err: unknown) => console.error(err),
        complete: () => console.log('Completed'),
      },
    );
  }
}
