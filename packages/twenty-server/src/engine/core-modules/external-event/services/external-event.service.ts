import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/**
 * Interface for external event input, matching the ClickHouse schema
 */
export interface ExternalEventInput {
  // The event name/type (maps to 'event' column in ClickHouse)
  event: string;

  // ID of the object related to this event
  objectId: string;

  // Type of the object related to this event (e.g., 'company', 'person', 'opportunity')
  objectType?: string;

  // User ID related to this event (optional)
  userId?: string;

  // Additional event properties (as JSON)
  properties: Record<string, any>;
}

/**
 * Service for handling external events
 */
@Injectable()
export class ExternalEventService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  /**
   * Create a new external event
   * @param workspaceId The workspace ID
   * @param eventInput The event input data
   * @returns Success status
   */
  async createExternalEvent(
    workspaceId: string,
    eventInput: ExternalEventInput,
  ): Promise<{ success: boolean }> {
    // Skip if ClickHouse is not configured
    const clickHouseUrl = this.twentyConfigService.get('CLICKHOUSE_URL');

    if (!clickHouseUrl) {
      return { success: true };
    }

    try {
      // Format the event for ClickHouse
      const timestamp = new Date().toISOString();

      const eventRecord = {
        // Required fields
        event: eventInput.event,
        timestamp,
        workspaceId,
        objectId: eventInput.objectId,

        // Optional fields with defaults
        userId: eventInput.userId || '',
        objectType: eventInput.objectType || '',
        properties: eventInput.properties || {},
      };

      // Insert into ClickHouse
      await this.clickHouseService.insert('externalEvent', [eventRecord]);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating external event:', error);

      return { success: false };
    }
  }
}
