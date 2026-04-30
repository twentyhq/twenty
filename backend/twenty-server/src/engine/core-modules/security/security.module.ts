import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IPAllowlistEntity } from './ip-allowlist.entity';
import { DeviceSessionEntity } from './device-session.entity';
import { SecurityService } from './security.service';
import { SecurityResolver } from './security.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([IPAllowlistEntity, DeviceSessionEntity]),
  ],
  providers: [SecurityService, SecurityResolver],
  exports: [SecurityService],
})
export class SecurityModule {}