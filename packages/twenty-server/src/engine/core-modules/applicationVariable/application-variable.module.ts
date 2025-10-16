import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariable } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationVariableService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([ApplicationVariable]),
        TypeORMModule,
      ],
    }),
  ],
  providers: [ApplicationVariableService, ApplicationVariableResolver],
  exports: [ApplicationVariableService],
})
export class ApplicationVariableModule {}
