import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [ObjectMetadataModule],
  providers: [...workspaceQueryBuilderFactories],
  exports: [],
})
export class WorkspaceQueryBuilderModule {}
