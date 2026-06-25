import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import axios, { type AxiosInstance } from 'axios';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

export class SchemaApi {
  constructor(private readonly client: AxiosInstance) {}

  async getSchema(options?: {
    appAccessToken?: string;
  }): Promise<ApiResponse<string>> {
    return this.introspectEndpoint('/graphql', options);
  }

  async getMetadataSchema(options?: {
    appAccessToken?: string;
  }): Promise<ApiResponse<string>> {
    return this.introspectEndpoint('/metadata', options);
  }

  private async introspectEndpoint(
    endpoint: string,
    options?: { appAccessToken?: string },
  ): Promise<ApiResponse<string>> {
    try {
      const introspectionQuery = getIntrospectionQuery();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: '*/*',
      };

      if (options?.appAccessToken) {
        headers.Authorization = `Bearer ${options.appAccessToken}`;
      }

      const response = await this.client.post(
        endpoint,
        {
          query: introspectionQuery,
        },
        { headers },
      );

      if (response.data.errors) {
        return {
          success: false,
          error: `GraphQL introspection errors: ${JSON.stringify(response.data.errors)}`,
        };
      }

      const schema = buildClientSchema(response.data.data);

      return {
        success: true,
        data: printSchema(schema),
        message: `Successfully loaded schema from ${endpoint}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error:
            error.response.data?.errors?.[0]?.message ||
            `Failed to load schema from ${endpoint}`,
        };
      }
      throw error;
    }
  }
}
