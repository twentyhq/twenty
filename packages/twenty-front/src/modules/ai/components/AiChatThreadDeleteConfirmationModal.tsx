import { Trans, useLingui } from '@lingui/react/macro';

import { useDeleteChatThread } from '@/ai/hooks/useDeleteChatThread';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

export const getAiChatThreadDeleteModalId = (
  threadId: string,
  scopeId: string,
) => `delete-chat-thread-modal-${scopeId}-${threadId}`;

type AiChatThreadDeleteConfirmationModalProps = {
  threadId: string;
  threadTitle: string;
  scopeId: string;
};

export const AiChatThreadDeleteConfirmationModal = ({
  threadId,
  threadTitle,
  scopeId,
}: AiChatThreadDeleteConfirmationModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { deleteChatThread } = useDeleteChatThread();

  const modalInstanceId = getAiChatThreadDeleteModalId(threadId, scopeId);

  const handleDelete = async () => {
    await deleteChatThread(threadId);
    closeModal(modalInstanceId);
  };

  // TODO: server uses TypeORM softDelete (sets deletedAt) but there is no
  // restore UI and no cron purges deleted agent chat threads. Once a recovery
  // flow lands (filter for "Deleted" + restoreChatThread mutation + retention
  // job), update the copy below to reflect the actual retention window.
  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={t`Delete chat`}
      subtitle={
        <Trans>
          <strong>{threadTitle}</strong> and all its messages will be removed.
        </Trans>
      }
      onConfirmClick={handleDelete}
      confirmButtonText={t`Delete`}
      confirmButtonAccent="danger"
    />
  );
};
