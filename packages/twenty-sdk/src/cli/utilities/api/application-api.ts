import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import axios, { type AxiosInstance } from 'axios';
import { type Manifest } from 'twenty-shared/application';
import {
  type MetadataValidationErrorResponse,
  type SyncAction,
} from 'twenty-shared/metadata';

export class ApplicationApi {
  constructor(private readonly client: AxiosInstance) {}

  async syncMarketplaceCatalog(): Promise<ApiResponse<boolean>> {
    try {
      const query = `
        mutation SyncMarketplaceCatalog {
          syncMarketplaceCatalog
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
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data.syncMarketplaceCatalog,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async findApplicationRegistrationByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<
    ApiResponse<{
      id: string;
      universalIdentifier: string;
      name: string;
      oAuthClientId: string;
    } | null>
  > {
    try {
      const query = `
        query FindApplicationRegistrationByUniversalIdentifier($universalIdentifier: String!) {
          findApplicationRegistrationByUniversalIdentifier(universalIdentifier: $universalIdentifier) {
            id
            universalIdentifier
            name
            oAuthClientId
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
        return {
          success: false,
          error: response.data.errors[0],
        };
      }

      return {
        success: true,
        data: response.data.data
          .findApplicationRegistrationByUniversalIdentifier,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async createApplicationRegistration(input: {
    name: string;
    universalIdentifier: string;
  }): Promise<
    ApiResponse<{
      applicationRegistration: {
        id: string;
        universalIdentifier: string;
        oAuthClientId: string;
      };
      clientSecret: string;
    }>
  > {
    try {
      const mutation = `
        mutation CreateApplicationRegistration($input: CreateApplicationRegistrationInput!) {
          createApplicationRegistration(input: $input) {
            applicationRegistration {
              id
              universalIdentifier
              oAuthClientId
            }
            clientSecret
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query: mutation,
          variables: { input },
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
        data: response.data.data.createApplicationRegistration,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async rotateApplicationRegistrationClientSecret(
    id: string,
  ): Promise<ApiResponse<{ clientSecret: string }>> {
    try {
      const mutation = `
        mutation RotateApplicationRegistrationClientSecret($id: String!) {
          rotateApplicationRegistrationClientSecret(id: $id) {
            clientSecret
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query: mutation,
          variables: { id },
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
        data: response.data.data.rotateApplicationRegistrationClientSecret,
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

      const response = await this.client.post(
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

  async createDevelopmentApplication(input: {
    universalIdentifier: string;
    name: string;
  }): Promise<ApiResponse<{ id: string; universalIdentifier: string }>> {
    try {
      const mutation = `
        mutation CreateDevelopmentApplication($universalIdentifier: String!, $name: String!) {
          createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
            id
            universalIdentifier
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query: mutation,
          variables: input,
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
        data: response.data.data.createDevelopmentApplication,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async syncApplication(
    manifest: Manifest,
    options?: { dryRun?: boolean },
  ): Promise<
    ApiResponse<
      {
        applicationUniversalIdentifier: string;
        actions: SyncAction[];
      },
      MetadataValidationErrorResponse
    >
  > {
    try {
      const isDryRun = options?.dryRun ?? false;

      const mutation = isDryRun
        ? `
        mutation SyncApplication($manifest: JSON!, $dryRun: Boolean) {
          syncApplication(manifest: $manifest, dryRun: $dryRun) {
            applicationUniversalIdentifier
            actions
          }
        }
      `
        : `
        mutation SyncApplication($manifest: JSON!) {
          syncApplication(manifest: $manifest) {
            applicationUniversalIdentifier
            actions
          }
        }
      `;

      const variables = isDryRun ? { manifest, dryRun: true } : { manifest };

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
          error: response.data.errors[0]?.extensions,
          message: response.data.errors[0]?.message,
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
        message: serializeError(error),
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
}
