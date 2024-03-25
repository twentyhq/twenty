import { Module } from '@nestjs/common';

import { ApiRestQueryBuilderFactory } from 'src/engine/api/rest/api-rest-query-builder/api-rest-query-builder.factory';
import { apiRestQueryBuilderFactories } from 'src/engine/api/rest/api-rest-query-builder/factories/factories';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  providers: [...apiRestQueryBuilderFactories, ApiRestQueryBuilderFactory],
  exports: [ApiRestQueryBuilderFactory],
})
export class ApiRestQueryBuilderModule {}
