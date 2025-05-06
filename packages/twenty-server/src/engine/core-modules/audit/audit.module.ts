import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { AuditResolver } from './audit.resolver';

import { AuditService } from './services/audit.service';

@Module({
  providers: [AuditResolver, AuditService],
  imports: [JwtModule, ClickHouseModule],
  exports: [AuditService],
})
export class AuditModule {}
