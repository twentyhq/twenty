import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { type EventSink } from 'src/engine/core-modules/event-logs/ingest/event-sink';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

@Injectable()
export class ClickHouseEventSink implements EventSink {
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
          throw new Error(
            `Failed to insert ${rows.length} ${table} row(s) into ClickHouse`,
          );
        }
      }),
    );
  }
}
