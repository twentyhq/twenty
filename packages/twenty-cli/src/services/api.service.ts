import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import chalk from 'chalk';
import { type ApiResponse, type AppManifest } from '../types/config.types';
import { ConfigService } from './config.service';

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
              'Authentication failed. Please run `twenty auth login` first.',
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
        query FindManyAgents {
          findManyAgents {
            id
            name
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
            'x-schema-version': '6',
          },
        },
      );

      return response.status === 200 && !response.data.errors;
    } catch {
      return false;
    }
  }

  async syncApplication(manifest: AppManifest): Promise<ApiResponse> {
    try {
      const mutation = `
        mutation SyncApplication($manifest: JSON!) {
          syncApplication(manifest: $manifest) {
            id
            standardId
            label
            description
            version
            createdAt
            updatedAt
          }
        }
      `;

      const variables = {
        manifest,
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
            'x-schema-version': '6',
          },
        },
      );

      if (response.data.errors) {
        return {
          success: false,
          error:
            response.data.errors[0]?.message || 'Failed to sync application',
        };
      }

      return {
        success: true,
        data: response.data.data.syncApplication,
        message: `Successfully synced application: ${manifest.label}`,
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

  async installApplication(
    source: string,
    sourceType: 'git' | 'local' | 'marketplace' = 'local',
  ): Promise<ApiResponse> {
    // For now, installation is the same as syncing a local manifest
    // In the future, this could handle different source types
    try {
      if (sourceType === 'local') {
        // Try to load manifest using the new loader
        try {
          const { loadAppManifest } = await import(
            '../utils/app-manifest-loader'
          );
          const manifest = await loadAppManifest(source);
          return this.syncApplication(manifest);
        } catch (manifestError) {
          return {
            success: false,
            error: `Failed to load manifest: ${manifestError instanceof Error ? manifestError.message : 'Unknown error'}`,
          };
        }
      }

      return {
        success: false,
        error: `Source type "${sourceType}" not yet supported`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Installation failed',
      };
    }
  }

  async listApplications(): Promise<ApiResponse> {
    try {
      const query = `
        query FindManyAgents {
          findManyAgents {
            id
            name
            label
            description
            isCustom
            createdAt
            updatedAt
          }
        }
      `;

      const response: AxiosResponse = await this.client.post('/metadata', {
        query,
      });

      if (response.data.errors) {
        return {
          success: false,
          error: response.data.errors[0]?.message || 'Failed to fetch agents',
        };
      }

      return {
        success: true,
        data: response.data.data.findManyAgents,
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

  async getWorkspaces(): Promise<ApiResponse> {
    try {
      const query = `
        query CurrentUser {
          currentUser {
            id
            email
            currentWorkspace {
              id
              displayName
            }
          }
        }
      `;

      const response: AxiosResponse = await this.client.post('/metadata', {
        query,
      });

      if (response.data.errors) {
        return {
          success: false,
          error:
            response.data.errors[0]?.message || 'Failed to fetch workspace',
        };
      }

      const workspace = response.data.data.currentUser?.currentWorkspace;
      return {
        success: true,
        data: workspace ? [workspace] : [],
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
}
