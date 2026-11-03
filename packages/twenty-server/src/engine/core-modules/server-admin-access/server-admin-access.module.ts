import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { ServerAdminAuditLogInterceptor } from 'src/engine/core-modules/server-admin-access/interceptors/server-admin-audit-log.interceptor';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';

// Global so the admin guards, which are referenced from many resolver modules, can inject it.
@Global()
@Module({
  imports: [EventLogEmitterModule],
  providers: [
    ServerAdminAccessService,
    { provide: APP_INTERCEPTOR, useClass: ServerAdminAuditLogInterceptor },
  ],
  exports: [ServerAdminAccessService],
})
export class ServerAdminAccessModule {}
