import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';
import { type FileFolder } from 'twenty-shared/types';
import { pascalCase } from 'twenty-shared/utils';

export type ApplicationFileUploadRequest = {
  fileFolder: FileFolder;
  filePath: string;
  size: number;
};

export type ApplicationFileUploadTarget = {
  fileId: string;
  filePath: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export type ApplicationFileUploadError = {
  fileFolder: string;
  filePath: string;
  message: string;
};

export type CreateApplicationFileUploadsResult = {
  targets: ApplicationFileUploadTarget[];
  errors: ApplicationFileUploadError[];
};

export type ApplicationFileCompletionError = {
  fileId: string;
  message: string;
};

export type CompleteApplicationFileUploadsResult = {
  files: { id: string; path: string }[];
  errors: ApplicationFileCompletionError[];
};

export type FileUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export type AppTarballRegistration = {
  id: string;
  universalIdentifier: string;
  name: string;
};

export class FileApi {
  constructor(private readonly client: AxiosInstance) {}

  async createFileUpload({
    filename,
    size,
    fileFolder,
  }: {
    filename: string;
    size: number;
    fileFolder: FileFolder;
  }): Promise<ApiResponse<FileUploadTarget>> {
    const mutation = `
      mutation CreateFileUpload(
        $filename: String!
        $size: Float!
        $fileFolder: FileFolder!
      ) {
        createFileUpload(
          filename: $filename
          size: $size
          fileFolder: $fileFolder
        ) {
          fileId
          uploadUrl
          contentType
          expiresAt
        }
      }
    `;

    return this.runMetadataMutation<FileUploadTarget>({
      mutation,
      variables: { filename, size, fileFolder: pascalCase(fileFolder) },
      resultKey: 'createFileUpload',
      defaultErrorMessage: 'Failed to create file upload',
    });
  }

  async completeAppTarballUpload({
    fileId,
  }: {
    fileId: string;
  }): Promise<ApiResponse<AppTarballRegistration>> {
    const mutation = `
      mutation CompleteAppTarballUpload($fileId: UUID!) {
        completeAppTarballUpload(fileId: $fileId) {
          id
          universalIdentifier
          name
        }
      }
    `;

    return this.runMetadataMutation<AppTarballRegistration>({
      mutation,
      variables: { fileId },
      resultKey: 'completeAppTarballUpload',
      defaultErrorMessage: 'Failed to complete tarball upload',
    });
  }

  async installTarballApp({
    universalIdentifier,
  }: {
    universalIdentifier: string;
  }): Promise<ApiResponse<boolean, MetadataValidationErrorResponse>> {
    try {
      const mutation = `
        mutation InstallApplication($universalIdentifier: String!) {
          installApplication(universalIdentifier: $universalIdentifier) {
            id
          }
        }
      `;

      const response: AxiosResponse = await this.client.post(
        '/metadata',
        {
          query: mutation,
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
          error: response.data.errors[0]?.extensions,
          message:
            response.data.errors[0]?.message || 'Failed to install application',
        };
      }

      return {
        success: true,
        data: response.data.data.installApplication,
      };
    } catch (error) {
      return {
        success: false,
        message: serializeError(error),
      };
    }
  }

  async createApplicationFileUploads({
    applicationUniversalIdentifier,
    files,
  }: {
    applicationUniversalIdentifier: string;
    files: ApplicationFileUploadRequest[];
  }): Promise<ApiResponse<CreateApplicationFileUploadsResult>> {
    const mutation = `
      mutation CreateApplicationFileUploads($applicationUniversalIdentifier: String!, $files: [ApplicationFileUploadRequestInput!]!) {
        createApplicationFileUploads(applicationUniversalIdentifier: $applicationUniversalIdentifier, files: $files) {
          targets {
            fileId
            filePath
            uploadUrl
            contentType
            expiresAt
          }
          errors {
            fileFolder
            filePath
            message
          }
        }
      }
    `;

    return this.runMetadataMutation<CreateApplicationFileUploadsResult>({
      mutation,
      variables: {
        applicationUniversalIdentifier,
        files: files.map(({ fileFolder, filePath, size }) => ({
          fileFolder: pascalCase(fileFolder),
          filePath,
          size,
        })),
      },
      resultKey: 'createApplicationFileUploads',
      defaultErrorMessage: 'Failed to create application file uploads',
    });
  }

  async completeApplicationFileUploads({
    applicationUniversalIdentifier,
    fileIds,
  }: {
    applicationUniversalIdentifier: string;
    fileIds: string[];
  }): Promise<ApiResponse<CompleteApplicationFileUploadsResult>> {
    const mutation = `
      mutation CompleteApplicationFileUploads($applicationUniversalIdentifier: String!, $fileIds: [UUID!]!) {
        completeApplicationFileUploads(applicationUniversalIdentifier: $applicationUniversalIdentifier, fileIds: $fileIds) {
          files {
            id
            path
          }
          errors {
            fileId
            message
          }
        }
      }
    `;

    return this.runMetadataMutation<CompleteApplicationFileUploadsResult>({
      mutation,
      variables: { applicationUniversalIdentifier, fileIds },
      resultKey: 'completeApplicationFileUploads',
      defaultErrorMessage: 'Failed to complete application file uploads',
    });
  }

  private async runMetadataMutation<TData>({
    mutation,
    variables,
    resultKey,
    defaultErrorMessage,
  }: {
    mutation: string;
    variables: Record<string, unknown>;
    resultKey: string;
    defaultErrorMessage: string;
  }): Promise<ApiResponse<TData>> {
    try {
      const response: AxiosResponse = await this.client.post(
        '/metadata',
        { query: mutation, variables },
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
          error: response.data.errors[0]?.message || defaultErrorMessage,
        };
      }

      return {
        success: true,
        data: response.data.data[resultKey],
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
}
