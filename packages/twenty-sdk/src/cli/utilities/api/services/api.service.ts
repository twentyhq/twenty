import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import chalk from 'chalk';
import {
  buildClientSchema,
  getIntrospectionQuery,
  printSchema,
} from 'graphql/index';
import { createClient } from 'graphql-sse';
import * as fs from 'fs';
import * as path from 'path';
import { type ApiResponse } from '../types/api-response.types';
import { ConfigService } from '@/cli/utilities/config/services/config.service';
import {
  type PackageJson,
  type ApplicationManifest,
} from 'twenty-shared/application';

export class ApiService {
  private client: AxiosInstance;
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
    this.client = axios.create();

    this.client.interceptors.request.use(async (config) => {
      const twentyConfig = await this.configService.getConfig();

      config.baseURL = twentyConfig.apiUrl;

      if (twentyConfig.apiKey) {
        config.headers.Authorization = `Bearer ${twentyConfig.apiKey}`;
      }

      return config;
    });

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

  async validateAuth(): Promise<boolean> {
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

      return response.status === 200 && !response.data.errors;
    } catch {
      return false;
    }
  }

  async syncApplication({
    packageJson,
    yarnLock,
    manifest,
  }: {
    packageJson: PackageJson;
    yarnLock: string;
    manifest: ApplicationManifest;
  }): Promise<ApiResponse> {
    try {
      const mutation = `
        mutation SyncApplication($manifest: JSON!, $packageJson: JSON!, $yarnLock: String!) {
          syncApplication(manifest: $manifest, packageJson: $packageJson, yarnLock: $yarnLock)
        }
      `;

      const variables = {
        manifest,
        yarnLock,
        packageJson,
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
        data: response.data.data.syncApplication,
        message: `Successfully synced application: ${packageJson.name}`,
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

  async getSchema(): Promise<ApiResponse<string>> {
    try {
      const introspectionQuery = getIntrospectionQuery();

      const response = await this.client.post(
        '/graphql',
        {
          query: introspectionQuery,
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
        subscription SubscribeToLogs($input: ServerlessFunctionLogsInput!) {
          serverlessFunctionLogs(input: $input) {
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

    wsClient.subscribe<{ serverlessFunctionLogs: { logs: string } }>(
      {
        query,
        variables,
      },
      {
        next: ({ data }) => console.log(data?.serverlessFunctionLogs.logs),
        error: (err: unknown) => console.error(err),
        complete: () => console.log('Completed'),
      },
    );
  }

  async uploadFile({
    filePath,
    applicationUniversalIdentifier,
  }: {
    filePath: string;
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
      mutation UploadApplicationFile($file: Upload!, $universalIdentifier: !String, $filePath: !String) {
        uploadApplicationFile(file: $file, universalIdentifier: $fileFolder, filePath: $filePath)
      }
    `;

      const operations = JSON.stringify({
        query: mutation,
        variables: {
          file: null,
          universalIdentifier: applicationUniversalIdentifier,
          filePath,
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
        '/graphql',
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
        data: response.data.data.uploadFile,
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
