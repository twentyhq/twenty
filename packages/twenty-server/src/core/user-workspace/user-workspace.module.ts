import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/core/user-workspace/user-workspace.service';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { BillingModule } from 'src/core/billing/billing.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([UserWorkspace], 'core'),
        TypeORMModule,
        DataSourceModule,
        BillingModule,
      ],
      services: [UserWorkspaceService],
    }),
  ],
  exports: [UserWorkspaceService],
  providers: [UserWorkspaceService],
})
export class UserWorkspaceModule {}
