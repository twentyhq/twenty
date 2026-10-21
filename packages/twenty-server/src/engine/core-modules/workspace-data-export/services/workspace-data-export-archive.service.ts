import { Injectable } from '@nestjs/common';

import archiver, { type Archiver } from 'archiver';
import { once } from 'events';
import { Readable } from 'stream';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import {
  buildWorkspaceDataExportArchiveResource,
  buildWorkspaceDataExportPartResource,
} from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';

@Injectable()
export class WorkspaceDataExportArchiveService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async writeArchive({
    workspaceId,
    exportId,
    state,
  }: {
    workspaceId: string;
    exportId: string;
    state: WorkspaceDataExportState;
  }): Promise<number> {
    const archive = archiver('zip', { zlib: { level: 1 } });
    const upload = this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportArchiveResource({ workspaceId, exportId }),
      stream: archive,
      mimeType: 'application/zip',
    });
    const failure = new Promise<never>((_, reject) => {
      archive.once('error', reject);
      upload.catch(reject);
    });

    failure.catch(() => undefined);

    try {
      for (const table of state.tables) {
        await this.appendEntry({
          archive,
          failure,
          name: `${table.nameSingular}.csv`,
          source: Readable.from(
            this.readParts({
              workspaceId,
              exportId,
              partNames: state.partNamesByTable[table.nameSingular] ?? [],
            }),
          ),
        });
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
    state: WorkspaceDataExportState;
  }) {
    return {
      workspaceId,
      workspaceName: state.workspaceName,
      exportedAt: new Date().toISOString(),
      objects: state.tables.map((table) => ({
        nameSingular: table.nameSingular,
        labelSingular: table.labelSingular,
        file: `${table.nameSingular}.csv`,
        rowCount: (state.partNamesByTable[table.nameSingular] ?? []).reduce(
          (total, partName) => total + (state.rowCountByPart[partName] ?? 0),
          0,
        ),
      })),
    };
  }

  private async *readParts({
    workspaceId,
    exportId,
    partNames,
  }: {
    workspaceId: string;
    exportId: string;
    partNames: string[];
  }): AsyncGenerator<Buffer> {
    for (const partName of partNames) {
      const stream = await this.fileStorageService.readFile(
        buildWorkspaceDataExportPartResource({
          workspaceId,
          exportId,
          partName,
        }),
      );

      for await (const chunk of stream) {
        yield chunk;
      }
    }
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
