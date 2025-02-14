import { Module } from '@nestjs/common';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';

@Module({
  imports: [DomainManagerModule],
  providers: [GuardRedirectService],
  exports: [GuardRedirectService],
})
export class GuardRedirectModule {}
