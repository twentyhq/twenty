import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GraphQLUpload, FileUpload } from 'graphql-upload';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UseGuards(JwtAuthGuard)
@Resolver()
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => String)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('fileFolder', { type: () => FileFolder, nullable: true })
    fileFolder: FileFolder,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const { path } = await this.fileUploadService.uploadFile({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
    });

    return path;
  }

  @Mutation(() => String)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('fileFolder', { type: () => FileFolder, nullable: true })
    fileFolder: FileFolder,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
    });

    return paths[0];
  }
}
