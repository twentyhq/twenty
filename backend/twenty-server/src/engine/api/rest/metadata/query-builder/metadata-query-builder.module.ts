import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { metadataQueryBuilderFactories } from 'src/engine/api/rest/metadata/query-builder/factories/metadata-factories';

@Module({
  imports: [AuthModule],
  providers: [...metadataQueryBuilderFactories, MetadataQueryBuilderFactory],
  exports: [MetadataQueryBuilderFactory],
})
export class MetadataQueryBuilderModule {}
