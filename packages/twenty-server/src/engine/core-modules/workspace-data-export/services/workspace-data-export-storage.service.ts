import { Injectable } from '@nestjs/common';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { buildWorkspaceDataExportFolder } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-folder.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';

type ExportKey = { workspaceId: string; exportId: string };

@Injectable()
export class WorkspaceDataExportStorageService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async deleteParts(key: ExportKey): Promise<void> {
    await this.fileStorageService.deleteFolder(
      buildWorkspaceDataExportFolder({ ...key, folder: 'parts' }),
    );
  }

  async deleteExportFolder(key: ExportKey): Promise<void> {
    await this.fileStorageService.deleteFolder(
      buildWorkspaceDataExportFolder({ ...key, folder: 'export' }),
    );
  }

  async discard({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: Pick<FileEntity, 'id' | 'applicationId'>;
  }): Promise<void> {
    await this.deleteExportFolder({ workspaceId, exportId: file.id });
    await this.fileStorageService.deleteFile({
      ...buildWorkspaceDataExportResource({
        workspaceId,
        exportId: file.id,
        file: { type: 'archive' },
      }),
      applicationId: file.applicationId,
    });
  }
}
