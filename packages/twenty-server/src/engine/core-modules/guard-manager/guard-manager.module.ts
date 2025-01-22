import { Module } from '@nestjs/common';

import { GuardErrorManagerService } from 'src/engine/core-modules/guard-manager/services/guard-error-manager.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [DomainManagerModule],
  providers: [GuardErrorManagerService],
  exports: [GuardErrorManagerService],
})
export class GuardManagerModule {}
