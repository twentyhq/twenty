import { Trans, useLingui } from '@lingui/react/macro';

import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';
import { useDeleteChatThread } from '@/ai/hooks/useDeleteChatThread';
import { aiChatThreadPendingDeleteFamilyState } from '@/ai/states/aiChatThreadPendingDeleteState';
import { getAiChatThreadDeleteModalId } from '@/ai/utils/getAiChatThreadDeleteModalId';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatThreadDeleteConfirmationModalProps = {
  surface: AiChatThreadActionsSurface;
};

export const AiChatThreadDeleteConfirmationModal = ({
  surface,
}: AiChatThreadDeleteConfirmationModalProps) => {
  const { t } = useLingui();
  const { deleteChatThread } = useDeleteChatThread();
  const aiChatThreadPendingDelete = useAtomFamilyStateValue(
    aiChatThreadPendingDeleteFamilyState,
    surface,
  );
  const setAiChatThreadPendingDelete = useSetAtomFamilyState(
    aiChatThreadPendingDeleteFamilyState,
    surface,
  );

  const modalInstanceId = getAiChatThreadDeleteModalId(surface);

  const handleDelete = async () => {
    if (aiChatThreadPendingDelete === null) return;

    await deleteChatThread(aiChatThreadPendingDelete.threadId);
    setAiChatThreadPendingDelete(null);
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
          <strong>{aiChatThreadPendingDelete?.threadTitle ?? ''}</strong> and
          all its messages will be removed.
        </Trans>
      }
      onConfirmClick={handleDelete}
      onClose={() => setAiChatThreadPendingDelete(null)}
      confirmButtonText={t`Delete`}
      confirmButtonAccent="danger"
    />
  );
};
