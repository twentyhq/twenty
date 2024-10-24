import { Injectable } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import { v4 as uuidV4 } from 'uuid';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { settings } from 'src/engine/constants/settings';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { getCropSize } from 'src/utils/image';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileStorage: FileStorageService,
    private readonly fileService: FileService,
  ) {}

  private async _uploadFile({
    file,
    filename,
    mimeType,
    folder,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    folder: string;
  }) {
    await this.fileStorage.write({
      file,
      name: filename,
      mimeType,
      folder,
    });
  }

  private _sanitizeFile({
    file,
    ext,
    mimeType,
  }: {
    file: Buffer | Uint8Array | string;
    ext: string;
    mimeType: string | undefined;
  }): Buffer | Uint8Array | string {
    if (ext === 'svg' || mimeType === 'image/svg+xml') {
      const window = new JSDOM('').window;
      const purify = DOMPurify(window);

      return purify.sanitize(file.toString());
    }

    return file;
  }

  async uploadFile({
    file,
    filename,
    mimeType,
    fileFolder,
    workspaceId,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
    workspaceId: string;
  }) {
    const ext = filename.split('.')?.[1];
    const id = uuidV4();
    const name = `${id}${ext ? `.${ext}` : ''}`;
    const folder = this.getWorkspaceFolderName(workspaceId, fileFolder);

    await this._uploadFile({
      file: this._sanitizeFile({ file, ext, mimeType }),
      filename: name,
      mimeType,
      folder,
    });

    const signedPayload = await this.fileService.encodeFileToken({
      workspaceId: workspaceId,
    });

    return {
      id,
      mimeType,
      path: `${fileFolder}/${name}?token=${signedPayload}`,
    };
  }

  async uploadImage({
    file,
    filename,
    mimeType,
    fileFolder,
    workspaceId,
  }: {
    file: Buffer | Uint8Array | string;
    filename: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
    workspaceId: string;
  }) {
    const ext = filename.split('.')?.[1];
    const id = uuidV4();
    const name = `${id}${ext ? `.${ext}` : ''}`;

    const cropSizes = settings.storage.imageCropSizes[fileFolder];

    if (!cropSizes) {
      throw new Error(`No crop sizes found for ${fileFolder}`);
    }

    const sizes = cropSizes.map((shortSize) => getCropSize(shortSize));
    const images = await Promise.all(
      sizes.map((size) =>
        sharp(file).resize({
          [size?.type || 'width']: size?.value ?? undefined,
        }),
      ),
    );

    const paths: Array<string> = [];

    await Promise.all(
      images.map(async (image, index) => {
        const buffer = await image.toBuffer();
        const folder = this.getWorkspaceFolderName(workspaceId, fileFolder);

        paths.push(`${fileFolder}/${cropSizes[index]}/${name}`);

        return this._uploadFile({
          file: buffer,
          filename: `${cropSizes[index]}/${name}`,
          mimeType,
          folder,
        });
      }),
    );

    return {
      id,
      mimeType,
      paths,
    };
  }

  private getWorkspaceFolderName(workspaceId: string, fileFolder: FileFolder) {
    return `workspace-${workspaceId}/${fileFolder}`;
  }
}
