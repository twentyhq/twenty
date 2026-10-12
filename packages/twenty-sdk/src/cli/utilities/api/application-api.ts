import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { type ApplicationExport } from '@/cli/utilities/pull/application-export-type';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { buildUnsupportedServerVersionMessage } from '@/cli/utilities/version/build-unsupported-server-version-message';
import { isServerVersionSupported } from '@/cli/utilities/version/is-server-version-supported';
import axios, { type AxiosInstance } from 'axios';
import { type Manifest } from 'twenty-shared/application';
import {
  type MetadataValidationErrorResponse,
  type SyncAction,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import sdkPackageJson from '../../../../package.json';

const isUnknownServerVersionFieldError = (
  message: string | undefined,
): boolean => message?.includes('Cannot query field "serverVersion"') ?? false;

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

  async exportApplication(
    universalIdentifier: string,
  ): Promise<ApiResponse<ApplicationExport>> {
    try {
      const query = `
        query ExportApplication($universalIdentifier: UUID!) {
          exportApplication(universalIdentifier: $universalIdentifier) {
            application {
              universalIdentifier
              displayName
              sourceType
            }
            manifest
            coverage {
              metadataName
              universalIdentifier
              status
              reason
            }
            files {
              folder
              path
              content
            }
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
        data: response.data.data.exportApplication,
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

  async getApplicationCoreGraphqlSchema(
    applicationUniversalIdentifier: string,
  ): Promise<ApiResponse<string>> {
    try {
      const query = `
        query ApplicationCoreGraphqlSchema($applicationUniversalIdentifier: String!) {
          applicationCoreGraphqlSchema(applicationUniversalIdentifier: $applicationUniversalIdentifier)
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query,
          variables: { applicationUniversalIdentifier },
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
        data: response.data.data.applicationCoreGraphqlSchema,
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
    options?: { dryRun?: boolean; inferDeletionFromMissingEntities?: boolean },
  ): Promise<
    ApiResponse<
      {
        applicationUniversalIdentifier: string;
        actions: SyncAction[];
        serverVersion: string | null;
      },
      MetadataValidationErrorResponse
    >
  > {
    try {
      const optionalArguments = [
        options?.dryRun ? 'dryRun' : null,
        options?.inferDeletionFromMissingEntities === false
          ? 'inferDeletionFromMissingEntities'
          : null,
      ].filter(isDefined);

      const variableDeclarations = [
        '$manifest: JSON!',
        ...optionalArguments.map((argument) => `$${argument}: Boolean`),
      ].join(', ');
      const argumentAssignments = [
        'manifest: $manifest',
        ...optionalArguments.map((argument) => `${argument}: $${argument}`),
      ].join(', ');

      const mutation = `
        mutation SyncApplication(${variableDeclarations}) {
          syncApplication(${argumentAssignments}) {
            applicationUniversalIdentifier
            actions
            serverVersion
          }
        }
      `;

      const variables = {
        manifest,
        ...(options?.dryRun ? { dryRun: true } : {}),
        ...(options?.inferDeletionFromMissingEntities === false
          ? { inferDeletionFromMissingEntities: false }
          : {}),
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
        const message: string | undefined = response.data.errors[0]?.message;

        if (isUnknownServerVersionFieldError(message)) {
          return {
            success: false,
            message: buildUnsupportedServerVersionMessage(),
          };
        }

        return {
          success: false,
          error: response.data.errors[0]?.extensions,
          message,
        };
      }

      const syncResult = response.data.data.syncApplication;

      if (
        !isServerVersionSupported({
          serverVersion: syncResult.serverVersion,
          supportedServerVersionRange: sdkPackageJson.engines.twenty,
        })
      ) {
        return {
          success: false,
          message: buildUnsupportedServerVersionMessage(
            syncResult.serverVersion,
          ),
        };
      }

      return {
        success: true,
        data: syncResult,
        message: `Successfully synced application: ${manifest.application.displayName}`,
      };
    } catch (error) {
      const message = serializeError(error);

      return {
        success: false,
        message: isUnknownServerVersionFieldError(message)
          ? buildUnsupportedServerVersionMessage()
          : message,
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
