import { Module } from '@nestjs/common';

import { HostnameGuardService } from './hostname-guard.service';

@Module({
  providers: [HostnameGuardService],
  exports: [HostnameGuardService],
})
export class HostnameGuardModule {}
