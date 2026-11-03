import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useOpenCoreAgentsDeleteDialog } from '@/object-core/agents/hooks/useOpenCoreAgentsDeleteDialog';
import { coreAgentsDeleteTargetFamilyState } from '@/object-core/agents/states/coreAgentsDeleteTargetFamilyState';
import { useDeleteCoreAgents } from '@/object-core/agents/hooks/useDeleteCoreAgents';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { getCoreAgentsDeleteDialogId } from '@/object-core/agents/utils/getCoreAgentsDeleteDialogId';
import { getDeleteCoreAgentsConfirmationContent } from '@/object-core/agents/utils/getDeleteCoreAgentsConfirmationContent';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type CoreAgentsDeleteButtonProps = {
  tableId: string;
  selectedAgentIds: string[];
};

export const CoreAgentsDeleteButton = ({
  tableId,
  selectedAgentIds,
}: CoreAgentsDeleteButtonProps) => {
  const coreAgentsDeleteTarget = useAtomFamilyStateValue(
    coreAgentsDeleteTargetFamilyState,
    tableId,
  );
  const { openCoreAgentsDeleteDialog } = useOpenCoreAgentsDeleteDialog(tableId);
  const { deleteCoreAgents } = useDeleteCoreAgents(tableId);
  const coreAgentsIsDeleting = useAtomFamilyStateValue(
    coreAgentsIsDeletingFamilyState,
    tableId,
  );
  const dialogId = getCoreAgentsDeleteDialogId(tableId);
  const { title, subtitle, confirmButtonText } =
    getDeleteCoreAgentsConfirmationContent(coreAgentsDeleteTarget.length);

  return (
    <>
      {isNonEmptyArray(selectedAgentIds) && (
        <CommandMenuButton
          command={{
            key: dialogId,
            label: t`Delete selected agents`,
            shortLabel: t`Delete`,
            Icon: IconTrash,
          }}
          onClick={openCoreAgentsDeleteDialog}
          disabled={coreAgentsIsDeleting}
          loading={coreAgentsIsDeleting}
        />
      )}
      <ConfirmationDialog
        dialogId={dialogId}
        title={title}
        subtitle={subtitle}
        confirmButtonText={confirmButtonText}
        onConfirmClick={async () => {
          await deleteCoreAgents({ agentIds: coreAgentsDeleteTarget });
        }}
        shouldWaitForConfirmBeforeClosing
        loading={coreAgentsIsDeleting}
      />
    </>
  );
};
