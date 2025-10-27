import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([ApplicationVariableEntity])],
  providers: [
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
  ],
  exports: [ApplicationVariableEntityService],
})
export class ApplicationVariableEntityModule {}
