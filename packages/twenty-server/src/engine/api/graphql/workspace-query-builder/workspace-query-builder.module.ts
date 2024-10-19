import { Module } from '@nestjs/common';

import { RecordPositionQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [ObjectMetadataModule],
  providers: [...workspaceQueryBuilderFactories],
  exports: [RecordPositionQueryFactory],
})
export class WorkspaceQueryBuilderModule {}
