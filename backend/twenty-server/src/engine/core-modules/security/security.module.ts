import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IPAllowlistEntity } from './ip-allowlist.entity';
import { DeviceSessionEntity } from './device-session.entity';
import { SecurityService } from './security.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([IPAllowlistEntity, DeviceSessionEntity]),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}