/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/enterprise-key-validation.cron.job';
import { EnterpriseResolver } from 'src/engine/core-modules/enterprise/enterprise.resolver';
import { EnterpriseKeyService } from 'src/engine/core-modules/enterprise/services/enterprise-key.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Module({
  imports: [
    TwentyConfigModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    EnterpriseKeyService,
    EnterpriseKeyValidationCronJob,
    EnterpriseResolver,
  ],
  exports: [EnterpriseKeyService, EnterpriseKeyValidationCronJob],
})
export class EnterpriseModule {}
