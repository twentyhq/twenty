import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { type EventSink } from 'src/engine/core-modules/audit/sinks/event-sink';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

// Writes every event type to its ClickHouse table. The only per-type logic is
// the table name carried by the envelope — rows are inserted as-is. This is the
// single place that gates on ClickHouse being configured.
@Injectable()
export class ClickHouseEventSink implements EventSink {
  private readonly logger = new Logger(ClickHouseEventSink.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async write(events: WorkspaceEventEnvelope[]): Promise<void> {
    if (events.length === 0 || !this.clickHouseService.getMainClient()) {
      return;
    }

    const rowsByTable = new Map<string, Record<string, unknown>[]>();

    for (const event of events) {
      const rows = rowsByTable.get(event.table) ?? [];

      rows.push(event.row);
      rowsByTable.set(event.table, rows);
    }

    await Promise.all(
      [...rowsByTable.entries()].map(async ([table, rows]) => {
        const result = await this.clickHouseService.insert(table, rows);

        if (!result.success) {
          this.logger.error(`Failed to insert ${rows.length} ${table} rows`);
        }
      }),
    );
  }
}
