import { ConfigService } from '@/cli/utilities/config/config-service';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import chalk from 'chalk';
import * as fs from 'fs';
import { createClient } from 'graphql-sse';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import * as path from 'path';
import { type Manifest } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';
import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { pascalCase } from 'twenty-shared/utils';

export class ApiService {
  private client: AxiosInstance;
  private configService: ConfigService;

  constructor(options?: { disableInterceptors: boolean }) {
    const { disableInterceptors = false } = options || {};
    this.configService = new ConfigService();
    this.client = axios.create();

    this.client.interceptors.request.use(async (config) => {
      const twentyConfig = await this.configService.getConfig();

      config.baseURL = twentyConfig.apiUrl;

      if (!config.headers.Authorization && twentyConfig.apiKey) {
        config.headers.Authorization = `Bearer ${twentyConfig.apiKey}`;
      }

      return config;
    });

    if (disableInterceptors) {
      return;
    }

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error(
            chalk.red(
              'Authentication failed. Please run `twenty auth:login` first.',
            ),
          );
        } else if (error.response?.status === 403) {
          console.error(
            chalk.red(
              'Access denied. Check your API key and workspace permissions.',
            ),
          );
        } else if (error.code === 'ECONNREFUSED') {
          console.error(
            chalk.red('Cannot connect to Twenty server. Is it running?'),
          );
        }
        throw error;
      },
    );
  }

  async validateAuth(): Promise<{ authValid: boolean; serverUp: boolean }> {
    try {
      const query = `
        query CurrentWorkspace {
          currentWorkspace {
            id
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      return {
        authValid: response.status === 200 && !response.data.errors,
        serverUp: response.status === 200,
      };
    } catch {
      return {
        authValid: false,
        serverUp: false,
      };
    }
  }

  async findOneApplication(
    universalIdentifier: string,
  ): Promise<ApiResponse<{ id: string; universalIdentifier: string } | null>> {
    try {
      const query = `
        query FindOneApplication($universalIdentifier: UUID!) {
          findOneApplication(universalIdentifier: $universalIdentifier) {
            id
            universalIdentifier
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query,
          variables: { universalIdentifier },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      if (response.data.errors) {
        const isNotFound = response.data.errors.some(
          (error: { extensions?: { code?: string } }) =>
            error.extensions?.code === 'NOT_FOUND',
        );

        if (isNotFound) {
          return { success: true, data: null };
        }

        return {
          success: false,
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.findOneApplication,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async generateApplicationToken(applicationId: string): Promise<
    ApiResponse<{
      applicationAccessToken: { token: string; expiresAt: string };
      applicationRefreshToken: { token: string; expiresAt: string };
    }>
  > {
    try {
      const mutation = `
        mutation GenerateApplicationToken($applicationId: UUID!) {
          generateApplicationToken(applicationId: $applicationId) {
            applicationAccessToken {
              token
              expiresAt
            }
            applicationRefreshToken {
              token
              expiresAt
            }
          }
        }
      `;

      const response: AxiosResponse = await this.client.post(
        '/metadata',
        {
          query: mutation,
          variables: { applicationId },
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
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.generateApplicationToken,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async renewApplicationToken(applicationRefreshToken: string): Promise<
    ApiResponse<{
      applicationAccessToken: { token: string; expiresAt: string };
      applicationRefreshToken: { token: string; expiresAt: string };
    }>
  > {
    try {
      const mutation = `
        mutation RenewApplicationToken($applicationRefreshToken: String!) {
          renewApplicationToken(applicationRefreshToken: $applicationRefreshToken) {
            applicationAccessToken {
              token
              expiresAt
            }
            applicationRefreshToken {
              token
              expiresAt
            }
          }
        }
      `;

      const response: AxiosResponse = await this.client.post(
        '/metadata',
        {
          query: mutation,
          variables: { applicationRefreshToken },
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
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.renewApplicationToken,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async createApplication(
    manifest: Manifest,
  ): Promise<ApiResponse<{ id: string; universalIdentifier: string }>> {
    try {
      const mutation = `
        mutation CreateOneApplication($input: CreateApplicationInput!) {
          createOneApplication(input: $input) {
            id
            universalIdentifier
          }
        }
      `;

      const variables = {
        input: {
          universalIdentifier: manifest.application.universalIdentifier,
          name: manifest.application.displayName,
          version: '0.0.1',
          sourcePath: 'cli-sync',
        },
      };

      const response: AxiosResponse = await this.client.post(
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
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.createOneApplication,
        message: `Successfully create application: ${manifest.application.displayName}`,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async syncApplication(manifest: Manifest): Promise<ApiResponse> {
    try {
      const mutation = `
        mutation SyncApplication($manifest: JSON!) {
          syncApplication(manifest: $manifest) {
            applicationUniversalIdentifier
            actions
          }
        }
      `;

      const variables = { manifest };

      const response: AxiosResponse = await this.client.post(
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
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.syncApplication,
        message: `Successfully synced application: ${manifest.application.displayName}`,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async uninstallApplication(
    universalIdentifier: string,
  ): Promise<ApiResponse> {
    try {
      const mutation = `
        mutation UninstallApplication($universalIdentifier: String!) {
          uninstallApplication(universalIdentifier: $universalIdentifier)
        }
      `;

      const variables = { universalIdentifier };

      const response: AxiosResponse = await this.client.post(
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
            response.data.errors[0]?.message || 'Failed to delete application',
        };
      }

      return {
        success: true,
        data: response.data.data.uninstallApplication,
        message: 'Successfully uninstalled application',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error: error.response.data?.errors?.[0]?.message || error.message,
        };
      }
      throw error;
    }
  }

  async getSchema(options?: {
    authToken?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const introspectionQuery = getIntrospectionQuery();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: '*/*',
      };

      if (options?.authToken) {
        headers.Authorization = `Bearer ${options.authToken}`;
      }

      const response = await this.client.post(
        '/graphql',
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
        message: 'Successfully load schema',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error:
            error.response.data.errors[0]?.message ||
            'Failed to load graphql Schema',
        };
      }
      throw error;
    }
  }

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

      const response = await this.client.post(
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

      const response = await this.client.post(
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
    const twentyConfig = await this.configService.getConfig();

    const wsClient = createClient({
      url: twentyConfig.apiUrl + '/graphql',
      headers: {
        Authorization: `Bearer ${twentyConfig.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
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

  async uploadFile({
    filePath,
    builtHandlerPath,
    fileFolder,
    applicationUniversalIdentifier,
  }: {
    filePath: string;
    builtHandlerPath: string;
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
  }): Promise<ApiResponse<boolean>> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        return {
          success: false,
          error: `File not found: ${absolutePath}`,
        };
      }

      const filename = path.basename(absolutePath);
      const buffer = fs.readFileSync(absolutePath);
      const mimeType = this.getMimeType(filename);

      const mutation = `
      mutation UploadApplicationFile($file: Upload!, $applicationUniversalIdentifier: String!, $fileFolder: FileFolder!, $filePath: String!) {
        uploadApplicationFile(file: $file, applicationUniversalIdentifier: $applicationUniversalIdentifier, fileFolder: $fileFolder, filePath: $filePath)
        { path }
      }
    `;

      const graphqlEnumFileFolder = pascalCase(fileFolder);

      const operations = JSON.stringify({
        query: mutation,
        variables: {
          file: null,
          applicationUniversalIdentifier,
          filePath: builtHandlerPath,
          fileFolder: graphqlEnumFileFolder,
        },
      });

      const map = JSON.stringify({
        '0': ['variables.file'],
      });

      const formData = new FormData();

      formData.append('operations', operations);
      formData.append('map', map);
      formData.append(
        '0',
        new Blob([new Uint8Array(buffer)], { type: mimeType }),
        filename,
      );

      const response: AxiosResponse = await this.client.post(
        '/metadata',
        formData,
      );

      if (response.data.errors) {
        return {
          success: false,
          error: response.data.errors[0]?.message || 'Failed to upload file',
        };
      }

      return {
        success: true,
        data: response.data.data.uploadApplicationFile,
        message: `Successfully uploaded ${filename}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error: error.response.data?.errors?.[0]?.message || error.message,
        };
      }

      return {
        success: false,
        error,
      };
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.jsx': 'application/javascript',
      '.tsx': 'application/typescript',
      '.html': 'text/html',
      '.css': 'text/css',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
