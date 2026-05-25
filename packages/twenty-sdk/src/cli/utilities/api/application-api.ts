import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type Manifest } from 'twenty-shared/application';

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
      if (axios.isAxiosError(error) && error.response) {
        const graphqlErrors = error.response.data?.errors;

        if (Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
          return {
            success: false,
            error: graphqlErrors[0]?.message || error.message,
          };
        }

        return {
          success: false,
          error:
            error.response.data?.message ||
            `HTTP ${error.response.status}: ${error.message}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : error,
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
}
