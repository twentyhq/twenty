import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { type FlatAgentChatChannelMember } from '@/metadata-store/types/FlatAgentChatChannelMember';

// Mutations apply their own result to the store so the sidebar updates
// before the broadcast echo arrives, which is also what keeps the UI right
// when the stream is disconnected.
export const useApplyAgentChatChannelStoreChange = () => {
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const upsertChannel = (channel: FlatAgentChatChannel) => {
    addToDraft({ key: 'agentChatChannels', items: [channel] });
    applyChanges();
  };

  const removeChannel = (channelId: string) => {
    removeFromDraft({ key: 'agentChatChannels', itemIds: [channelId] });
    applyChanges();
  };

  const upsertMember = (member: FlatAgentChatChannelMember) => {
    addToDraft({ key: 'agentChatChannelMembers', items: [member] });
    applyChanges();
  };

  const removeMembers = (memberIds: string[]) => {
    removeFromDraft({ key: 'agentChatChannelMembers', itemIds: memberIds });
    applyChanges();
  };

  return { upsertChannel, removeChannel, upsertMember, removeMembers };
};
