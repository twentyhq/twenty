import { ApiService } from '@/cli/utilities/api/services/api.service';
import path from 'path';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import { FileFolder } from 'twenty-shared/types';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { type ApplicationManifest } from 'twenty-shared/application';

export class UploadService {
  private apiService = new ApiService();
  private applicationUniversalIdentifier: string;
  private appPath: string;
  private logger = createLogger('file-upload');

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
    const uploadResult = await this.apiService.uploadFile({
      filePath: path.join(this.appPath, OUTPUT_DIR, builtPath),
      builtHandlerPath: builtPath,
      fileFolder,
      applicationUniversalIdentifier: this.applicationUniversalIdentifier,
    });

    if (uploadResult.success) {
      this.logger.success(`☁️ Uploaded ${builtPath}`);
    } else {
      this.logger.error(
        `Failed to upload ${builtPath} -- ${uploadResult.error}`,
      );
    }
  }

  async uploadManifestBuiltFiles(manifest: ApplicationManifest) {
    const uploadPromises = [
      ...manifest.functions.map((builtFile) =>
        this.uploadFile({
          builtPath: builtFile.builtHandlerPath,
          fileFolder: FileFolder.BuiltFunction,
        }),
      ),
      ...manifest.frontComponents.map((builtFile) =>
        this.uploadFile({
          builtPath: builtFile.builtComponentPath,
          fileFolder: FileFolder.BuiltFrontComponent,
        }),
      ),
    ];

    await Promise.all(uploadPromises);
  }
}
