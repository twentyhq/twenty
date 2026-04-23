/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/enterprise-key-validation.cron.job';
import { EnterpriseResolver } from 'src/engine/core-modules/enterprise/enterprise.resolver';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Module({
  imports: [
    TwentyConfigModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity, AppTokenEntity]),
  ],
  providers: [
    EnterprisePlanService,
    EnterpriseKeyValidationCronJob,
    EnterpriseResolver,
  ],
  exports: [EnterprisePlanService, EnterpriseKeyValidationCronJob],
})
export class EnterpriseModule {}
