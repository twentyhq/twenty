import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminConsoleHandoffResolver } from 'src/engine/core-modules/admin-console/admin-console-handoff.resolver';
import { AdminConsoleSignInResolver } from 'src/engine/core-modules/admin-console/admin-console-sign-in.resolver';
import { AdminConsoleSessionService } from 'src/engine/core-modules/admin-console/services/admin-console-session.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Module({
  imports: [
    TokenModule,
    UserSessionModule,
    EventLogEmitterModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    AdminConsoleSessionService,
    AdminConsoleHandoffResolver,
    AdminConsoleSignInResolver,
  ],
})
export class AdminConsoleModule {}
