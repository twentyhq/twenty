import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariable } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([ApplicationVariable])],
  providers: [ApplicationVariableService, ApplicationVariableResolver],
  exports: [ApplicationVariableService],
})
export class ApplicationVariableModule {}
