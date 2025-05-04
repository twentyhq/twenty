import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { ExternalEventController } from './external-event.controller';
import { ExternalEventResolver } from './external-event.resolver';

import { ExternalEventService } from './services/external-event.service';
import { ExternalEventTokenService } from './services/external-event-token.service';

@Module({
  controllers: [ExternalEventController],
  providers: [
    ExternalEventService,
    ExternalEventResolver,
    ExternalEventTokenService,
  ],
  imports: [
    JwtModule,
    ClickHouseModule,
    TypeOrmModule.forFeature([AppToken], 'core'),
  ],
  exports: [ExternalEventService, ExternalEventTokenService],
})
export class ExternalEventModule {}
