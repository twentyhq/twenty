import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';
import { type FileFolder } from 'twenty-shared/types';
import { pascalCase } from 'twenty-shared/utils';

const MIME_TYPES: Record<string, string> = {
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
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();

  return MIME_TYPES[ext] || 'application/octet-stream';
};

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

export class FileApi {
  constructor(private readonly client: AxiosInstance) {}

  // TODO: Migrate to MetadataClient once available
  // (see https://github.com/twentyhq/core-team-issues/issues/2289)
  async uploadAppTarball({
    tarballBuffer,
    universalIdentifier,
  }: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
  }): Promise<
    ApiResponse<{
      id: string;
      universalIdentifier: string;
      name: string;
    }>
  > {
    try {
      const mutation = `
        mutation UploadAppTarball($file: Upload!, $universalIdentifier: String) {
          uploadAppTarball(file: $file, universalIdentifier: $universalIdentifier) {
            id
            universalIdentifier
            name
          }
        }
      `;

      const operations = JSON.stringify({
        query: mutation,
        variables: {
          file: null,
          universalIdentifier: universalIdentifier ?? null,
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
        new Blob([new Uint8Array(tarballBuffer)], {
          type: 'application/gzip',
        }),
        'app.tar.gz',
      );

      const response: AxiosResponse = await this.client.post(
        '/metadata',
        formData,
      );

      if (response.data.errors) {
        return {
          success: false,
          error: response.data.errors[0]?.message || 'Failed to upload tarball',
        };
      }

      return {
        success: true,
        data: response.data.data.uploadAppTarball,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          return {
            success: false,
            error: error.response.data?.errors?.[0]?.message || error.message,
            isAuthError: true,
          };
        }

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
      const mimeType = getMimeType(filename);

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

  // Reserves one upload url per file in a single call. Uploading a whole app
  // through uploadFile costs one rate-limited api call per file, which large
  // apps blow through long before they are fully uploaded.
  async createApplicationFileUploads({
    applicationUniversalIdentifier,
    files,
  }: {
    applicationUniversalIdentifier: string;
    files: ApplicationFileUploadRequest[];
  }): Promise<ApiResponse<ApplicationFileUploadTarget[]>> {
    const mutation = `
      mutation CreateApplicationFileUploads($applicationUniversalIdentifier: String!, $files: [ApplicationFileUploadRequestInput!]!) {
        createApplicationFileUploads(applicationUniversalIdentifier: $applicationUniversalIdentifier, files: $files) {
          fileId
          filePath
          uploadUrl
          contentType
          expiresAt
        }
      }
    `;

    return this.runMetadataMutation<ApplicationFileUploadTarget[]>({
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
  }): Promise<ApiResponse<{ id: string; path: string }[]>> {
    const mutation = `
      mutation CompleteApplicationFileUploads($applicationUniversalIdentifier: String!, $fileIds: [UUID!]!) {
        completeApplicationFileUploads(applicationUniversalIdentifier: $applicationUniversalIdentifier, fileIds: $fileIds) {
          id
          path
        }
      }
    `;

    return this.runMetadataMutation<{ id: string; path: string }[]>({
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
