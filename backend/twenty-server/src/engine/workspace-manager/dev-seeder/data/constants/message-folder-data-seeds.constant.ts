import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';

type MessageFolderDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  isSynced: boolean;
  isSentFolder: boolean;
  messageChannelId: string;
  pendingSyncAction: MessageFolderPendingSyncAction;
};

export const MESSAGE_FOLDER_DATA_SEED_COLUMNS: (keyof MessageFolderDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'name',
    'isSynced',
    'isSentFolder',
    'messageChannelId',
    'pendingSyncAction',
  ];

export const MESSAGE_FOLDER_DATA_SEED_IDS = {
  TIM_INBOX: '20202020-f1a2-4b3c-8d4e-5f6a7b8c9d0e',
  TIM_SENT: '20202020-f1a2-4b3c-8d4e-5f6a7b8c9d1e',
  JONY_INBOX: '20202020-f1a2-4b3c-8d4e-5f6a7b8c9d2e',
  JANE_INBOX: '20202020-f1a2-4b3c-8d4e-5f6a7b8c9d3e',
  JANE_SENT: '20202020-f1a2-4b3c-8d4e-5f6a7b8c9d4e',
};

export const MESSAGE_FOLDER_DATA_SEEDS: MessageFolderDataSeed[] = [
  {
    id: MESSAGE_FOLDER_DATA_SEED_IDS.TIM_INBOX,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    name: 'INBOX',
    isSynced: true,
    isSentFolder: false,
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  },
  {
    id: MESSAGE_FOLDER_DATA_SEED_IDS.TIM_SENT,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    name: 'Sent',
    isSynced: true,
    isSentFolder: true,
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  },
  {
    id: MESSAGE_FOLDER_DATA_SEED_IDS.JONY_INBOX,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    name: 'INBOX',
    isSynced: true,
    isSentFolder: false,
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  },
  {
    id: MESSAGE_FOLDER_DATA_SEED_IDS.JANE_INBOX,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    name: 'INBOX',
    isSynced: true,
    isSentFolder: false,
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  },
  {
    id: MESSAGE_FOLDER_DATA_SEED_IDS.JANE_SENT,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    name: 'Sent',
    isSynced: true,
    isSentFolder: true,
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  },
];
