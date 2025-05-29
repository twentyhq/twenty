import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { Bucket, Storage } from '@google-cloud/storage';
import { Repository } from 'typeorm';

import { folderName } from 'src/engine/core-modules/google-cloud/types/FolderNames';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

const execAsync = promisify(exec);

@Injectable()
export class GoogleStorageService {
  private readonly storage: Storage;

  bucketProjectId = this.twentyConfigService.get('BUCKET_PROJECT_ID');
  bucketKeyFilename =
    process.cwd() + this.twentyConfigService.get('BUCKET_KEYFILENAME');
  bucketName = this.twentyConfigService.get('BUCKET_NAME');

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.storage = new Storage({
      projectId: this.bucketProjectId,
      keyFilename: this.bucketKeyFilename,
    });
  }

  private async validateOrCreateStorage(
    workspaceId: string,
    bucket: Bucket,
    isInternal: boolean,
  ): Promise<string> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const storageName = workspace.displayName
      ?.toLowerCase()
      .replace(/\s+/g, '-');

    if (!storageName) {
      throw new Error('Workspace name is empty');
    }

    const storagePrefix = isInternal ? `internal_${storageName}` : storageName;

    try {
      const [files] = await bucket.getFiles({ prefix: storagePrefix });

      if (files.length === 0) {
        await this.createStorageStructure(bucket, storagePrefix);
      }
    } catch (error) {
      throw new Error(
        `Failed to access bucket ${storagePrefix}: ${error.message}`,
      );
    }

    return storagePrefix;
  }

  private async createStorageStructure(bucket: Bucket, storageName: string) {
    const subFolders = [
      folderName.IMAGES,
      folderName.DOCS,
      folderName.AUDIOS,
      folderName.VIDEOS,
    ];

    await Promise.all(
      subFolders.map(async (subFolder) => {
        const folder = bucket.file(`${storageName}/${subFolder}/`);

        await folder.save('', {
          contentType: 'application/x-www-form-urlencoded',
        });
      }),
    );
  }

  async uploadFileToBucket(
    workspaceId: string,
    type: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    internal: boolean,
  ): Promise<string> {
    const validTypes = {
      image: folderName.IMAGES,
      document: folderName.DOCS,
      audio: folderName.AUDIOS,
      video: folderName.VIDEOS,
    };

    const folder = validTypes[type.toLowerCase() as keyof typeof validTypes];

    if (!folder) {
      throw new Error(
        `Invalid file type: ${type}. Allowed types are image, doc, and audio.`,
      );
    }

    const bucket = this.storage.bucket(this.bucketName);
    const storagePath = await this.validateOrCreateStorage(
      workspaceId,
      bucket,
      internal,
    );

    const destination = `${storagePath}/${folder}/${file.originalname}`;

    try {
      const buffer =
        type === 'audio'
          ? await this.convertAudioToMp3(file.originalname, file.buffer)
          : file.buffer;

      const fileUpload = bucket.file(destination);

      await fileUpload.save(buffer, {
        contentType: type === 'audio' ? 'audio/mpeg' : file.mimetype,
      });

      const [signedUrl] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: Date.now() + 90 * 24 * 60 * 60 * 1000, // 3 months
      });

      return signedUrl;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to upload file to ${storagePath}: ${error.message}`,
      );
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async convertAudioToMp3(
    originalname: string,
    buffer: Buffer,
  ): Promise<Buffer> {
    const tempDir = path.resolve(__dirname, './tmp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const inputPath = path.join(tempDir, originalname);
    const outputPath = path.join(tempDir, `${originalname}.mp3`);

    try {
      fs.writeFileSync(inputPath, buffer);

      const command = `ffmpeg -i ${inputPath} ${outputPath}`;

      await execAsync(command);

      const mp3Buffer = fs.readFileSync(outputPath);

      return mp3Buffer;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to convert audio:', error);
      throw new Error(`Failed to convert audio to MP3: ${error.message}`);
    } finally {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  }
}
