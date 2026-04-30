import { Trans, useLingui } from '@lingui/react/macro';

import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { useDeleteChatThread } from '@/ai/hooks/useDeleteChatThread';
import { aiChatThreadPendingDeleteFamilyState } from '@/ai/states/aiChatThreadPendingDeleteFamilyState';
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
