import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ApplicationVariableEntity]),
    PermissionsModule,
  ],
  providers: [
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
  ],
  exports: [ApplicationVariableEntityService],
})
export class ApplicationVariableEntityModule {}
