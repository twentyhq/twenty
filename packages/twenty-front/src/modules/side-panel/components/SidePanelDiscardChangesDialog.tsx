import { SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID } from '@/side-panel/constants/SidePanelDiscardChangesDialogId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { t } from '@lingui/core/macro';

export const SidePanelDiscardChangesDialog = () => {
  const { goBackOneSubPageOrMainPage } = useSidePanelHistory();

  return (
    <ConfirmationDialog
      dialogId={SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID}
      title={t`Discard draft?`}
      subtitle={t`What you entered will be lost.`}
      onConfirmClick={goBackOneSubPageOrMainPage}
      confirmButtonText={t`Discard`}
    />
  );
};
