import { Module } from '@nestjs/common';

import { ApiRestQueryBuilderFactory } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.factory';
import { apiRestQueryBuilderFactories } from 'src/core/api-rest/api-rest-query-builder/factories/factories';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { AuthModule } from 'src/core/auth/auth.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  providers: [...apiRestQueryBuilderFactories, ApiRestQueryBuilderFactory],
  exports: [ApiRestQueryBuilderFactory],
})
export class ApiRestQueryBuilderModule {}
