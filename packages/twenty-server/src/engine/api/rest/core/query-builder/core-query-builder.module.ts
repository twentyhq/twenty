import { Module } from '@nestjs/common';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  providers: [...coreQueryBuilderFactories, CoreQueryBuilderFactory],
  exports: [CoreQueryBuilderFactory],
})
export class CoreQueryBuilderModule {}
