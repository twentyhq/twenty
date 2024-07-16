import { EntityManager } from 'typeorm';

import { DEV_SEED_CONNECTED_ACCOUNT_IDS } from 'src/database/typeorm-seeds/workspace/connected-account';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

const tableName = 'calendarChannel';

export const seedCalendarChannels = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'connectedAccountId',
      'handle',
      'visibility',
      'isContactAutoCreationEnabled',
      'isSyncEnabled',
    ])
    .orIgnore()
    .values([
      {
        id: '59efdefe-a40f-4faf-bb9f-c6f9945b8203',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.TIM,
        handle: 'tim@apple.com',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        isContactAutoCreationEnabled: true,
        isSyncEnabled: true,
      },
    ])
    .execute();
};
