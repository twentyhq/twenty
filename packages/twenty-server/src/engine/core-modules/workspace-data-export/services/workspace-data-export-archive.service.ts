import { Injectable } from '@nestjs/common';

import archiver, { type Archiver } from 'archiver';
import { once } from 'events';
import { PassThrough, pipeline, Readable } from 'stream';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { buildWorkspaceDataExportFileNames } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-file-names.util';
import { buildWorkspaceDataExportObjects } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-objects.util';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';

type ArchiveState = Pick<
  WorkspaceDataExportState,
  'workspaceName' | 'objects' | 'partsByObject'
>;

@Injectable()
export class WorkspaceDataExportArchiveService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async writeArchive({
    workspaceId,
    exportId,
    state,
    onPartAdded,
  }: {
    workspaceId: string;
    exportId: string;
    state: ArchiveState;
    onPartAdded: () => Promise<void>;
  }): Promise<number> {
    const archive = archiver('zip', { zlib: { level: 1 } });
    const archiveBody = new PassThrough();

    pipeline(archive, archiveBody, () => undefined);

    const upload = this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportResource({
        workspaceId,
        exportId,
        file: { type: 'archive' },
      }),
      stream: archiveBody,
      mimeType: 'application/zip',
    });
    const failure = new Promise<never>((_, reject) => {
      archive.once('error', reject);
      upload.catch(reject);
    });

    failure.catch(() => undefined);

    try {
      for (const object of state.objects) {
        const parts = state.partsByObject[object.nameSingular];

        if (!isNonEmptyArray(parts)) {
          throw new WorkspaceDataExportException({
            message: `Export ${exportId} has no part for ${object.nameSingular}`,
            code: 'EXPORT_INCOMPLETE',
          });
        }

        const fileNames = buildWorkspaceDataExportFileNames({
          nameSingular: object.nameSingular,
          partCount: parts.length,
        });

        for (const [partIndex, part] of parts.entries()) {
          await this.appendEntry({
            archive,
            failure,
            name: fileNames[partIndex],
            source: await this.fileStorageService.readFile(
              buildWorkspaceDataExportResource({
                workspaceId,
                exportId,
                file: { type: 'part', partName: part.name },
              }),
            ),
          });
          await onPartAdded();
        }
      }

      await this.appendEntry({
        archive,
        failure,
        name: 'manifest.json',
        source: JSON.stringify(
          this.buildManifest({ workspaceId, state }),
          null,
          2,
        ),
      });

      await Promise.all([archive.finalize(), upload]);
    } catch (error) {
      archive.destroy(error);
      throw error;
    }

    return archive.pointer();
  }

  private buildManifest({
    workspaceId,
    state,
  }: {
    workspaceId: string;
    state: ArchiveState;
  }) {
    return {
      workspaceId,
      workspaceName: state.workspaceName,
      exportedAt: new Date().toISOString(),
      objects: buildWorkspaceDataExportObjects({
        ...state,
        completedObjectCount: state.objects.length,
      }).map(({ isExported: _isExported, ...object }) => ({
        ...object,
        files: buildWorkspaceDataExportFileNames({
          nameSingular: object.nameSingular,
          partCount: state.partsByObject[object.nameSingular].length,
        }),
      })),
    };
  }

  private async appendEntry({
    archive,
    failure,
    name,
    source,
  }: {
    archive: Archiver;
    failure: Promise<never>;
    name: string;
    source: Readable | string;
  }): Promise<void> {
    const entryWritten = once(archive, 'entry');

    if (source instanceof Readable) {
      source.once('error', (error) => archive.destroy(error));
    }

    archive.append(source, { name });
    await Promise.race([entryWritten, failure]);
  }
}
