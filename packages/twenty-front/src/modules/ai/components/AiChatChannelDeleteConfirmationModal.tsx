import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_CHANNEL_DELETE_MODAL_ID } from '@/ai/constants/AiChatChannelDeleteModalId';
import { useAiChatChannelIdFromPath } from '@/ai/hooks/useAiChatChannelIdFromPath';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { aiChatChannelPendingDeleteState } from '@/ai/states/aiChatChannelPendingDeleteState';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatChannelDeleteConfirmationModal = () => {
  const { t } = useLingui();
  const { deleteChatChannel } = useChatChannelActions();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();
  const currentChannelId = useAiChatChannelIdFromPath();
  const [aiChatChannelPendingDelete, setAiChatChannelPendingDelete] =
    useAtomState(aiChatChannelPendingDeleteState);

  const handleDelete = async () => {
    if (!isDefined(aiChatChannelPendingDelete)) {
      return;
    }

    const { channelId } = aiChatChannelPendingDelete;
    const isDeleted = await deleteChatChannel(channelId);

    setAiChatChannelPendingDelete(null);

    if (isDeleted && currentChannelId === channelId) {
      navigateToAiChatPage();
    }
  };

  return (
    <ConfirmationDialog
      dialogId={AI_CHAT_CHANNEL_DELETE_MODAL_ID}
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
