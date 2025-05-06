import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { ExternalEventInput } from 'src/engine/core-modules/external-event/dto/external-event.input';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { EventMetadataService } from './event-metadata.service';

@Injectable()
export class ExternalEventService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly eventMetadataService: EventMetadataService,
  ) {}

  async createExternalEvent(
    workspaceId: string,
    eventInput: ExternalEventInput,
  ): Promise<{ success: boolean }> {
    try {
      await this.eventMetadataService.findOrCreateEventMetadata(
        workspaceId,
        eventInput.event,
        eventInput.properties,
      );

      await this.eventMetadataService.registerValidationRules();

      const clickHouseUrl = this.twentyConfigService.get('CLICKHOUSE_URL');

      if (!clickHouseUrl) {
        return { success: true };
      }

      const timestamp = new Date().toISOString();

      const eventRecord = {
        event: eventInput.event,
        timestamp,
        workspaceId,
        objectId: eventInput.recordId,
        objectType: eventInput.objectMetadataId || '',
        properties: eventInput.properties || {},
      };

      await this.clickHouseService.insert('externalEvent', [eventRecord]);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating external event:', error);

      return { success: false };
    }
  }
}
