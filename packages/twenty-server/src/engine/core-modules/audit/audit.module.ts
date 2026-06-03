import { Module } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { ClickHouseEventSink } from 'src/engine/core-modules/audit/sinks/clickhouse-event.sink';
import { ConsoleEventSink } from 'src/engine/core-modules/audit/sinks/console-event.sink';
import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/audit/sinks/event-sink';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { AuditResolver } from './audit.resolver';

import { AuditService } from './services/audit.service';

const eventSinksProvider = {
  provide: EVENT_SINKS,
  useFactory: (
    twentyConfigService: TwentyConfigService,
    clickHouseEventSink: ClickHouseEventSink,
    consoleEventSink: ConsoleEventSink,
  ): EventSink[] => {
    const registry: Record<string, EventSink | undefined> = {
      // ClickHouse counts as a live destination only when it is configured, so
      // isEnabled() reflects reality and producers can skip work when absent.
      clickhouse: twentyConfigService.get('CLICKHOUSE_URL')
        ? clickHouseEventSink
        : undefined,
      console: consoleEventSink,
    };

    return twentyConfigService
      .get('EVENT_SINKS')
      .map((name) => registry[name.toLowerCase()])
      .filter(isDefined);
  },
  inject: [TwentyConfigService, ClickHouseEventSink, ConsoleEventSink],
};

@Module({
  providers: [
    AuditResolver,
    AuditService,
    ClickHouseEventSink,
    ConsoleEventSink,
    eventSinksProvider,
    WorkspaceEventSinkService,
  ],
  imports: [JwtModule, ClickHouseModule],
  exports: [AuditService, WorkspaceEventSinkService],
})
export class AuditModule {}
