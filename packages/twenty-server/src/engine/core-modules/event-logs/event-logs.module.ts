/* @license Enterprise */

import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { EventLogEmitterResolver } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.resolver';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ClickHouseEventSink } from 'src/engine/core-modules/event-logs/ingest/clickhouse-event.sink';
import { ConsoleEventSink } from 'src/engine/core-modules/event-logs/ingest/console-event.sink';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/event-logs/ingest/create-audit-log-from-internal-event';
import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/event-logs/ingest/event-sink';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { WorkspaceEventsConsumer } from 'src/engine/core-modules/event-logs/ingest/workspace-events.consumer';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { EventLogsLiveResolver } from './event-logs-live.resolver';
import { EventLogsResolver } from './event-logs.resolver';
import { EventLogsService } from './event-logs.service';

const eventSinksProvider = {
  provide: EVENT_SINKS,
  useFactory: (
    twentyConfigService: TwentyConfigService,
    clickHouseEventSink: ClickHouseEventSink,
    consoleEventSink: ConsoleEventSink,
  ): EventSink[] => {
    const registry: Record<string, EventSink | undefined> = {
      clickhouse: twentyConfigService.get('CLICKHOUSE_URL')
        ? clickHouseEventSink
        : undefined,
      console: consoleEventSink,
    };

    // hasOwnProperty (not `in`): a configured name like `constructor` would otherwise resolve to an inherited function and crash on .write().
    const isKnownSinkName = (name: string): boolean =>
      Object.prototype.hasOwnProperty.call(registry, name.toLowerCase());

    const configuredSinkNames = twentyConfigService.get('EVENT_SINKS');
    const unknownSinkNames = configuredSinkNames.filter(
      (name) => !isKnownSinkName(name),
    );

    if (unknownSinkNames.length > 0) {
      new Logger('WorkspaceEventSinks').warn(
        `Ignoring unknown EVENT_SINKS: ${unknownSinkNames.join(', ')}`,
      );
    }

    return configuredSinkNames
      .filter(isKnownSinkName)
      .map((name) => registry[name.toLowerCase()])
      .filter(isDefined);
  },
  inject: [TwentyConfigService, ClickHouseEventSink, ConsoleEventSink],
};

@Module({
  imports: [
    ClickHouseModule,
    PermissionsModule,
    BillingModule,
    EnterpriseModule,
    GuardRedirectModule,
    JwtModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    EventLogsResolver,
    EventLogsLiveResolver,
    EventLogsService,
    EventLogEmitterResolver,
    EventLogEmitterService,
    ClickHouseEventSink,
    ConsoleEventSink,
    eventSinksProvider,
    WorkspaceEventSinkService,
    WorkspaceEventsConsumer,
    CreateAuditLogFromInternalEvent,
  ],
  exports: [
    EventLogsService,
    EventLogEmitterService,
    WorkspaceEventSinkService,
  ],
})
export class EventLogsModule {}
