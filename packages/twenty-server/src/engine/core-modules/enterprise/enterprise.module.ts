/* @license Enterprise */

import { Module } from '@nestjs/common';

import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/enterprise-key-validation.cron.job';
import { EnterpriseKeyService } from 'src/engine/core-modules/enterprise/services/enterprise-key.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule],
  providers: [EnterpriseKeyService, EnterpriseKeyValidationCronJob],
  exports: [EnterpriseKeyService],
})
export class EnterpriseModule {}
