import { Injectable } from '@nestjs/common';

import {
  type ClickHouseInsertOptions,
  ClickHouseService,
} from 'src/database/clickHouse/clickHouse.service';
import { type EventSink } from 'src/engine/core-modules/event-logs/ingest/event-sink';
import {
  type WorkspaceEventEnvelope,
  type WorkspaceEventTable,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

const CLICKHOUSE_INSERT_OPTIONS_BY_TABLE: Partial<
  Record<WorkspaceEventTable, ClickHouseInsertOptions>
> = {
  pageview: {
    asyncInsertBusyTimeoutMaxMs: 100,
  },
};

@Injectable()
export class ClickHouseEventSink implements EventSink {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async write(events: WorkspaceEventEnvelope[]): Promise<void> {
    if (events.length === 0 || !this.clickHouseService.getMainClient()) {
      return;
    }

    const rowsByTable = new Map<
      WorkspaceEventTable,
      Record<string, unknown>[]
    >();

    for (const event of events) {
      const rows = rowsByTable.get(event.table) ?? [];

      rows.push(event.row);
      rowsByTable.set(event.table, rows);
    }

    await Promise.all(
      [...rowsByTable.entries()].map(async ([table, rows]) => {
        const result = await this.clickHouseService.insert(
          table,
          rows,
          CLICKHOUSE_INSERT_OPTIONS_BY_TABLE[table],
        );

        if (!result.success) {
          throw new Error(
            `Failed to insert ${rows.length} ${table} row(s) into ClickHouse`,
          );
        }
      }),
    );
  }
}
