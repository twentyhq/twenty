import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import DOMPurify from 'dompurify';
import FileType from 'file-type';
import sharp from 'sharp';
import { v4 } from 'uuid';

import { type FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { settings } from 'src/engine/constants/settings';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { getCropSize, getImageBufferFromUrl } from 'src/utils/image';

export type SignedFile = { path: string; token: string };

export type SignedFilesResult = {
  name: string;
  mimeType: string | undefined;
  files: SignedFile[];
};

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileStorage: FileStorageService,
    private readonly fileService: FileService,
    private readonly httpService: HttpService,
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
      const { JSDOM } = require('jsdom');
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
  }): Promise<SignedFilesResult> {
    const { ext, name } = buildFileInfo(filename);
    const folder = this.getWorkspaceFolderName(workspaceId, fileFolder);

    await this._uploadFile({
      file: this._sanitizeFile({ file, ext, mimeType }),
      filename: name,
      mimeType,
      folder,
    });

    const signedPayload = this.fileService.encodeFileToken({
      filename: name,
      workspaceId: workspaceId,
    });

    return {
      name,
      mimeType,
      files: [{ path: `${fileFolder}/${name}`, token: signedPayload }],
    };
  }

  async uploadImageFromUrl({
    imageUrl,
    fileFolder,
    workspaceId,
  }: {
    imageUrl: string;
    fileFolder: FileFolder;
    workspaceId: string;
  }) {
    const buffer = await getImageBufferFromUrl(
      imageUrl,
      this.httpService.axiosRef,
    );

    const type = await FileType.fromBuffer(buffer);

    return await this.uploadImage({
      file: buffer,
      filename: `${v4()}.${type?.ext}`,
      mimeType: type?.mime,
      fileFolder,
      workspaceId,
    });
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
  }): Promise<SignedFilesResult> {
    const { name } = buildFileInfo(filename);

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

    const files: Array<SignedFile> = [];

    await Promise.all(
      images.map(async (image, index) => {
        const buffer = await image.toBuffer();
        const folder = this.getWorkspaceFolderName(workspaceId, fileFolder);

        const token = this.fileService.encodeFileToken({
          filename: name,
          workspaceId: workspaceId,
        });

        files.push({
          path: `${fileFolder}/${cropSizes[index]}/${name}`,
          token,
        });

        return this._uploadFile({
          file: buffer,
          filename: `${cropSizes[index]}/${name}`,
          mimeType,
          folder,
        });
      }),
    );

    return {
      name,
      mimeType,
      files,
    };
  }

  private getWorkspaceFolderName(workspaceId: string, fileFolder: FileFolder) {
    return `workspace-${workspaceId}/${fileFolder}`;
  }
}
