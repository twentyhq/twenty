import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Resolver('GoogleStorage')
export class GoogleStorageResolver {
  constructor(private readonly googleStorageService: GoogleStorageService) {}

  @Mutation(() => String)
  async uploadFileToBucket(
    @Args('workspaceId') workspaceId: string,
    @Args('type') type: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('isInternal', { type: () => Boolean, nullable: true })
    isInternal?: boolean,
  ) {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const internal = isInternal ? true : false;

    return this.googleStorageService.uploadFileToBucket(
      workspaceId,
      type,
      {
        buffer: buffer,
        mimetype,
        originalname: filename,
      },
      internal,
    );
  }
}
