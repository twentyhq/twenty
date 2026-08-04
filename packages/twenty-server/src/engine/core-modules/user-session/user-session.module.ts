import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { UserSessionCleanupCronCommand } from 'src/engine/core-modules/user-session/crons/commands/user-session-cleanup.cron.command';
import { UserSessionCleanupCronJob } from 'src/engine/core-modules/user-session/crons/jobs/user-session-cleanup.cron.job';
import { CredentialedOriginService } from 'src/engine/core-modules/user-session/services/credentialed-origin.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionResolver } from 'src/engine/core-modules/user-session/user-session.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSessionEntity, AppTokenEntity]),
    JwtModule,
    EventLogEmitterModule,
    WorkspaceDomainsModule,
  ],
  providers: [
    UserSessionService,
    UserSessionCookieService,
    CredentialedOriginService,
    UserSessionResolver,
    UserSessionCleanupCronJob,
    UserSessionCleanupCronCommand,
  ],
  exports: [
    UserSessionService,
    UserSessionCookieService,
    CredentialedOriginService,
    UserSessionCleanupCronCommand,
  ],
})
export class UserSessionModule {}
