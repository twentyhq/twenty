import { Trans, useLingui } from '@lingui/react/macro';

import { AI_CHAT_CHANNEL_DELETE_MODAL_ID } from '@/ai/constants/AiChatChannelDeleteModalId';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { aiChatChannelPendingDeleteState } from '@/ai/states/aiChatChannelPendingDeleteState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatChannelDeleteConfirmationModal = () => {
  const { t } = useLingui();
  const { deleteChatChannel } = useChatChannelActions();
  const [aiChatChannelPendingDelete, setAiChatChannelPendingDelete] =
    useAtomState(aiChatChannelPendingDeleteState);

  const handleDelete = async () => {
    if (aiChatChannelPendingDelete === null) return;

    await deleteChatChannel(aiChatChannelPendingDelete.channelId);
    setAiChatChannelPendingDelete(null);
  };

  return (
    <ConfirmationModal
      modalInstanceId={AI_CHAT_CHANNEL_DELETE_MODAL_ID}
      title={t`Delete channel`}
      subtitle={
        <Trans>
          <strong>{aiChatChannelPendingDelete?.channelName ?? ''}</strong> will
          be removed. Its chats are kept and become private to their owners and
          participants.
        </Trans>
      }
      onConfirmClick={handleDelete}
      onClose={() => setAiChatChannelPendingDelete(null)}
      confirmButtonText={t`Delete`}
      confirmButtonColor="danger"
    />
  );
};
