import { Module } from '@nestjs/common';

import { FileRemoteContentService } from 'src/engine/core-modules/file/file-remote-content/services/file-remote-content.service';
import { RemoteFileOriginResolverRegistryService } from 'src/engine/core-modules/file/file-remote-content/services/remote-file-origin-resolver-registry.service';

@Module({
  providers: [
    FileRemoteContentService,
    RemoteFileOriginResolverRegistryService,
  ],
  exports: [FileRemoteContentService, RemoteFileOriginResolverRegistryService],
})
export class FileRemoteContentModule {}
