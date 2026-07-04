import { ApiService } from '@/cli/utilities/api/api-service';
import path, { relative } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';

export const normalizeArtifactPath = (artifactPath: string) => {
  return artifactPath.replaceAll('\\', '/');
};

export class FileUploader {
  private apiService = new ApiService();
  private applicationUniversalIdentifier: string;
  private appPath: string;

  constructor(options: {
    applicationUniversalIdentifier: string;
    appPath: string;
  }) {
    this.applicationUniversalIdentifier =
      options.applicationUniversalIdentifier;
    this.appPath = options.appPath;
  }

  async uploadFile({
    builtPath,
    fileFolder,
  }: {
    builtPath: string;
    fileFolder: FileFolder;
  }) {
    const builtHandlerPath = normalizeArtifactPath(
      relative(OUTPUT_DIR, builtPath),
    );

    return await this.apiService.uploadFile({
      filePath: path.join(this.appPath, builtPath),
      builtHandlerPath,
      fileFolder,
      applicationUniversalIdentifier: this.applicationUniversalIdentifier,
    });
  }
}
