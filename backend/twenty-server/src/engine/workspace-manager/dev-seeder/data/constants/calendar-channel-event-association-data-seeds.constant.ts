import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-data-seeds.constant';
import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';

type CalendarChannelEventAssociationDataSeed = {
  id: string;
  calendarChannelId: string;
  calendarEventId: string;
  eventExternalId: string;
  recurringEventExternalId: string;
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_COLUMNS: (keyof CalendarChannelEventAssociationDataSeed)[] =
  [
    'id',
    'calendarChannelId',
    'calendarEventId',
    'eventExternalId',
    'recurringEventExternalId',
  ];

const GENERATE_CALENDAR_CHANNEL_EVENT_ASSOCIATION_IDS = (): Record<
  string,
  string
> => {
  const ASSOCIATION_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 800; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    ASSOCIATION_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789abc`;
  }

  return ASSOCIATION_IDS;
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_IDS =
  GENERATE_CALENDAR_CHANNEL_EVENT_ASSOCIATION_IDS();

const GENERATE_CALENDAR_CHANNEL_EVENT_ASSOCIATION_SEEDS =
  (): CalendarChannelEventAssociationDataSeed[] => {
    const ASSOCIATION_SEEDS: CalendarChannelEventAssociationDataSeed[] = [];

    const EVENT_IDS = Object.keys(CALENDAR_EVENT_DATA_SEED_IDS).map(
      (key) =>
        CALENDAR_EVENT_DATA_SEED_IDS[
          key as keyof typeof CALENDAR_EVENT_DATA_SEED_IDS
        ],
    );

    const CHANNEL_IDS = [
      CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
      CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
      CALENDAR_CHANNEL_DATA_SEED_IDS.PHIL,
      CALENDAR_CHANNEL_DATA_SEED_IDS.COMPANY_MAIN,
      CALENDAR_CHANNEL_DATA_SEED_IDS.TEAM_CALENDAR,
    ];

    // Create associations for each event
    EVENT_IDS.forEach((eventId, index) => {
      // Distribute events across channels with weighted distribution
      let CHANNEL_ID: string;
      const CHANNEL_RAND = Math.random();

      if (CHANNEL_RAND < 0.3) {
        // 30% - Tim's personal calendar
        CHANNEL_ID = CHANNEL_IDS[0]; // TIM
      } else if (CHANNEL_RAND < 0.45) {
        // 15% - Jony's personal calendar
        CHANNEL_ID = CHANNEL_IDS[1]; // JONY
      } else if (CHANNEL_RAND < 0.6) {
        // 15% - Phil's personal calendar
        CHANNEL_ID = CHANNEL_IDS[2]; // PHIL
      } else if (CHANNEL_RAND < 0.8) {
        // 20% - Company main calendar
        CHANNEL_ID = CHANNEL_IDS[3]; // COMPANY_MAIN
      } else {
        // 20% - Team calendar
        CHANNEL_ID = CHANNEL_IDS[4]; // TEAM_CALENDAR
      }

      const ASSOCIATION_INDEX = index + 1;

      ASSOCIATION_SEEDS.push({
        id: CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_IDS[
          `ID_${ASSOCIATION_INDEX}`
        ],
        calendarChannelId: CHANNEL_ID,
        calendarEventId: eventId,
        eventExternalId: `external_event_${ASSOCIATION_INDEX}@calendar.com`,
        recurringEventExternalId: `recurring_${ASSOCIATION_INDEX}@calendar.com`,
      });
    });

    return ASSOCIATION_SEEDS;
  };

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEEDS =
  GENERATE_CALENDAR_CHANNEL_EVENT_ASSOCIATION_SEEDS();
