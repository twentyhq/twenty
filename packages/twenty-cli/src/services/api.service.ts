import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import chalk from 'chalk';
import {
  type ApiResponse,
  type AppManifest,
  type PackageJson,
} from '../types/config.types';
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
    manifest: AppManifest;
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
          error:
            response.data.errors[0]?.message || 'Failed to sync application',
        };
      }

      return {
        success: true,
        data: response.data.data.syncApplication,
        message: `Successfully synced application: ${packageJson.name}`,
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

  async deleteApplication(universalIdentifier: string): Promise<ApiResponse> {
    try {
      const mutation = `
        mutation DeleteApplication($universalIdentifier: String!) {
          deleteApplication(universalIdentifier: $universalIdentifier)
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
        data: response.data.data.deleteApplication,
        message: 'Successfully deleted application',
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
