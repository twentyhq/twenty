import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

type AiChatChannelPendingDelete = {
  channelId: string;
  channelName: string;
} | null;

export const aiChatChannelPendingDeleteState =
  createAtomState<AiChatChannelPendingDelete>({
    key: 'aiChatChannelPendingDeleteState',
    defaultValue: null,
  });
