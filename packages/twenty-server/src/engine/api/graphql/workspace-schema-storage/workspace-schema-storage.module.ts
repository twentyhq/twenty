import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/engine-metadata/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/engine-metadata/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceSchemaStorageService } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.service';

@Module({
  imports: [ObjectMetadataModule, WorkspaceCacheVersionModule],
  providers: [WorkspaceSchemaStorageService],
  exports: [WorkspaceSchemaStorageService],
})
export class WorkspaceSchemaStorageModule {}
