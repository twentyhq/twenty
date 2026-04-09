import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';
import { MESSAGE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

type MessageChannelMessageAssociationDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  messageExternalId: string;
  messageThreadExternalId: string;
  messageChannelId: string;
  messageId: string;
  direction: MessageDirection;
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_COLUMNS: (keyof MessageChannelMessageAssociationDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'messageExternalId',
    'messageThreadExternalId',
    'messageChannelId',
    'messageId',
    'direction',
  ];

const GENERATE_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS = (): Record<
  string,
  string
> => {
  const ASSOCIATION_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 600; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    ASSOCIATION_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789bcd`;
  }

  return ASSOCIATION_IDS;
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS =
  GENERATE_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS();

const GENERATE_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_SEEDS =
  (): MessageChannelMessageAssociationDataSeed[] => {
    const ASSOCIATION_SEEDS: MessageChannelMessageAssociationDataSeed[] = [];

    const MESSAGE_IDS = Object.keys(MESSAGE_DATA_SEED_IDS).map(
      (key) => MESSAGE_DATA_SEED_IDS[key as keyof typeof MESSAGE_DATA_SEED_IDS],
    );

    MESSAGE_IDS.forEach((messageId, index) => {
      const ASSOCIATION_INDEX = index + 1;

      const NOW = new Date();
      const RANDOM_DAYS_OFFSET = Math.floor(Math.random() * 90);
      const ASSOCIATION_DATE = new Date(
        NOW.getTime() - RANDOM_DAYS_OFFSET * 24 * 60 * 60 * 1000,
      );

      const CHANNEL_WEIGHT = Math.random();
      let CHANNEL_ID: string;

      // Tim's email (40% weight)
      if (CHANNEL_WEIGHT < 0.4) {
        CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.TIM;
      }
      // Jony's email (20% weight)
      else if (CHANNEL_WEIGHT < 0.6) {
        CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.JONY;
      }
      // Phil's email (15% weight)
      else if (CHANNEL_WEIGHT < 0.75) {
        CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.PHIL;
      }
      // Support channel (15% weight)
      else if (CHANNEL_WEIGHT < 0.9) {
        CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT;
      }
      // Sales channel (10% weight)
      else {
        CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.SALES;
      }

      // 50/50 split between incoming and outgoing messages
      const DIRECTION: MessageDirection =
        Math.random() < 0.5
          ? MessageDirection.INCOMING
          : MessageDirection.OUTGOING;

      // Generate unique external IDs for email sync
      const MESSAGE_EXTERNAL_ID = `msg-${ASSOCIATION_INDEX}-${Date.now()}`;
      const MESSAGE_THREAD_EXTERNAL_ID = `thread-${Math.floor(ASSOCIATION_INDEX / 2)}-${Date.now()}`;

      ASSOCIATION_SEEDS.push({
        id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS[
          `ID_${ASSOCIATION_INDEX}`
        ],
        createdAt: ASSOCIATION_DATE,
        updatedAt: ASSOCIATION_DATE,
        deletedAt: null,
        messageExternalId: MESSAGE_EXTERNAL_ID,
        messageThreadExternalId: MESSAGE_THREAD_EXTERNAL_ID,
        messageChannelId: CHANNEL_ID,
        messageId: messageId,
        direction: DIRECTION,
      });
    });

    return ASSOCIATION_SEEDS;
  };

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEEDS =
  GENERATE_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_SEEDS();
