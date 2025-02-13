import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { GoogleStorageResolver } from 'src/engine/core-modules/google-cloud/google-storage.resolver';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Workspace], 'core')],
    }),
  ],
  exports: [GoogleStorageService],
  providers: [GoogleStorageService, GoogleStorageResolver],
})
export class GoogleStorageModule {}
