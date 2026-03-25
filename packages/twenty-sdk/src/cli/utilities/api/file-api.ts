import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
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
  }): Promise<ApiResponse<boolean>> {
    try {
      const mutation = `
        mutation InstallMarketplaceApp($universalIdentifier: String!) {
          installMarketplaceApp(universalIdentifier: $universalIdentifier)
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
          error:
            response.data.errors[0]?.message || 'Failed to install application',
        };
      }

      return {
        success: true,
        data: response.data.data.installMarketplaceApp,
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
}
