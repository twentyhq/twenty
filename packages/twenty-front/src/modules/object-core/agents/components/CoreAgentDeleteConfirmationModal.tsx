import { useLingui } from '@lingui/react/macro';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CORE_AGENT_DELETE_DIALOG_ID } from '@/object-core/agents/constants/CoreAgentDeleteDialogId';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

import { useMutation } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';
import { DeleteOneAgentDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type CoreAgentDeleteConfirmationModalProps = {
  agentId: string;
};

export const CoreAgentDeleteConfirmationModal = ({
  agentId,
}: CoreAgentDeleteConfirmationModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();
  const [deleteAgent] = useMutation(DeleteOneAgentDocument);

  const handleDelete = async () => {
    try {
      await deleteAgent({
        variables: {
          input: { id: agentId },
        },
      });
      closeDialog(CORE_AGENT_DELETE_DIALOG_ID);
      navigate(AppPath.AgentIndexPage);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <ConfirmationDialog
      dialogId={CORE_AGENT_DELETE_DIALOG_ID}
      title={t`Delete Agent`}
      subtitle={t`This action cannot be undone. This will permanently delete your agent.`}
      onConfirmClick={handleDelete}
      confirmButtonText={t`Delete Agent`}
    />
  );
};
