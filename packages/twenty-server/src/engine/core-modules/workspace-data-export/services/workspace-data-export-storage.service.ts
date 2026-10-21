import { Injectable } from '@nestjs/common';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';

type ExportKey = { workspaceId: string; exportId: string };

@Injectable()
export class WorkspaceDataExportStorageService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceDataExportStateService: WorkspaceDataExportStateService,
  ) {}

  getArchiveResource({ workspaceId, exportId }: ExportKey) {
    return {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.WorkspaceDataExport,
      resourcePath: `${exportId}.zip`,
    };
  }

  getPartResource({
    workspaceId,
    exportId,
    partName,
  }: ExportKey & { partName: string }) {
    return {
      ...this.getArchiveResource({ workspaceId, exportId }),
      resourcePath: `${exportId}/parts/${partName}`,
    };
  }

  async deleteParts({ workspaceId, exportId }: ExportKey): Promise<void> {
    const { resourcePath: _archivePath, ...location } = this.getArchiveResource(
      { workspaceId, exportId },
    );

    await this.fileStorageService.deleteFolder({
      ...location,
      folderPath: exportId,
    });
  }

  // Removes everything an export owns so a new one can start.
  async discard({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: FileEntity;
  }): Promise<void> {
    await this.deleteParts({ workspaceId, exportId: file.id });
    await this.fileStorageService.deleteFile({
      ...this.getArchiveResource({ workspaceId, exportId: file.id }),
      applicationId: file.applicationId,
    });
    await this.workspaceDataExportStateService.delete({
      workspaceId,
      exportId: file.id,
    });
  }
}
