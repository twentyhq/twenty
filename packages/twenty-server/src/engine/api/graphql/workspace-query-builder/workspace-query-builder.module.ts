import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { FieldsStringFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/fields-string.factory';
import { RecordPositionQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { DuplicateModule } from 'src/engine/core-modules/duplicate/duplicate.module';

import { WorkspaceQueryBuilderFactory } from './workspace-query-builder.factory';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [ObjectMetadataModule, DuplicateModule],
  providers: [...workspaceQueryBuilderFactories, WorkspaceQueryBuilderFactory],
  exports: [
    WorkspaceQueryBuilderFactory,
    FieldsStringFactory,
    RecordPositionQueryFactory,
  ],
})
export class WorkspaceQueryBuilderModule {}
