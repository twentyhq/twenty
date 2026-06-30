import { Injectable, Logger } from '@nestjs/common';

import { type EventSink } from 'src/engine/core-modules/event-logs/ingest/event-sink';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

@Injectable()
export class ConsoleEventSink implements EventSink {
  private readonly logger = new Logger(ConsoleEventSink.name);

  async write(events: WorkspaceEventEnvelope[]): Promise<void> {
    for (const event of events) {
      if (event.table === 'applicationLog') {
        const context = `${event.row.logicFunctionName}:${event.row.executionId}`;

        switch (event.row.level) {
          case 'ERROR':
            this.logger.error(event.row.message, undefined, context);
            break;
          case 'WARN':
            this.logger.warn(event.row.message, context);
            break;
          case 'DEBUG':
            this.logger.debug(event.row.message, context);
            break;
          default:
            this.logger.log(event.row.message, context);
            break;
        }
      } else {
        this.logger.log(JSON.stringify(event.row), event.table);
      }
    }
  }
}
