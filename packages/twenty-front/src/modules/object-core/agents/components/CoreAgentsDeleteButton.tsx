import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useDeleteCoreAgents } from '@/object-core/agents/hooks/useDeleteCoreAgents';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentsDeleteDialogId } from '@/object-core/agents/utils/getCoreAgentsDeleteDialogId';
import { getDeleteCoreAgentsConfirmationContent } from '@/object-core/agents/utils/getDeleteCoreAgentsConfirmationContent';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

type CoreAgentsDeleteButtonProps = {
  tableId: string;
  selectedAgentIds: string[];
};

export const CoreAgentsDeleteButton = ({
  tableId,
  selectedAgentIds,
}: CoreAgentsDeleteButtonProps) => {
  const [agentsToDelete, setAgentsToDelete] = useState<
    Pick<CoreAgent, 'id' | 'label'>[]
  >([]);
  const apolloClient = useApolloClient();
  const { deleteCoreAgents } = useDeleteCoreAgents(tableId);
  const coreAgentsIsDeleting = useAtomFamilyStateValue(
    coreAgentsIsDeletingFamilyState,
    tableId,
  );
  const { openDialog } = useDialog();
  const dialogId = getCoreAgentsDeleteDialogId(tableId);
  const { title, subtitle, confirmButtonText, confirmationValue } =
    getDeleteCoreAgentsConfirmationContent(
      agentsToDelete.map(({ label }) => label),
    );

  const handleOpenConfirmation = () => {
    const selectedAgentIdSet = new Set(selectedAgentIds);
    const selectedAgents =
      apolloClient
        .readQuery({ query: FindManyAgentsDocument })
        ?.findManyAgents.filter(({ id }) => selectedAgentIdSet.has(id)) ?? [];

    if (!isNonEmptyArray(selectedAgents)) {
      return;
    }

    setAgentsToDelete(selectedAgents.map(({ id, label }) => ({ id, label })));
    openDialog(dialogId);
  };

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
          onClick={handleOpenConfirmation}
          disabled={coreAgentsIsDeleting}
          loading={coreAgentsIsDeleting}
        />
      )}
      <ConfirmationDialog
        dialogId={dialogId}
        title={title}
        subtitle={subtitle}
        confirmButtonText={confirmButtonText}
        confirmationValue={confirmationValue}
        confirmationPlaceholder={confirmationValue}
        onConfirmClick={async () => {
          await deleteCoreAgents({
            agentIds: agentsToDelete.map(({ id }) => id),
          });
        }}
        shouldWaitForConfirmBeforeClosing
        loading={coreAgentsIsDeleting}
      />
    </>
  );
};
