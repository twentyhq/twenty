import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { UserSessionCleanupCronCommand } from 'src/engine/core-modules/user-session/crons/commands/user-session-cleanup.cron.command';
import { UserSessionCleanupCronJob } from 'src/engine/core-modules/user-session/crons/jobs/user-session-cleanup.cron.job';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSessionEntity, AppTokenEntity]),
    JwtModule,
    EventLogEmitterModule,
  ],
  providers: [
    UserSessionService,
    UserSessionCookieService,
    UserSessionCleanupCronJob,
    UserSessionCleanupCronCommand,
  ],
  exports: [
    UserSessionService,
    UserSessionCookieService,
    UserSessionCleanupCronCommand,
  ],
})
export class UserSessionModule {}
