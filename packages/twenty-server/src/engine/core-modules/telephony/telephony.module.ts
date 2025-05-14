/* eslint-disable no-restricted-imports */
import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TelephonyService } from 'src/engine/core-modules/telephony/services/telephony.service';
import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { TelephonyResolver } from 'src/engine/core-modules/telephony/telephony.resolver';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Telephony, Workspace], 'core'),
        TypeORMModule,
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
    EnvironmentModule,
  ],
  exports: [TelephonyService, PabxService],
  providers: [
    TelephonyService,
    TelephonyResolver,
    TypeORMService,
    PabxService,
    EnvironmentService,
  ],
})
export class TelephonyModule {}
