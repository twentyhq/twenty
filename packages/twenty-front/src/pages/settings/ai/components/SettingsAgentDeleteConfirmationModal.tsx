import { Trans, useLingui } from '@lingui/react/macro';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

import { useMutation } from '@apollo/client/react';
import { SettingsPath } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components';
import { DeleteOneAgentDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

type SettingsAgentDeleteConfirmationModalProps = {
  agentId: string;
  agentName: string;
};

export const SettingsAgentDeleteConfirmationModal = ({
  agentId,
  agentName,
}: SettingsAgentDeleteConfirmationModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const [deleteAgent] = useMutation(DeleteOneAgentDocument);

  const handleDelete = async () => {
    try {
      await deleteAgent({
        variables: {
          input: { id: agentId },
        },
      });
      closeDialog(DELETE_AGENT_MODAL_ID);
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <ConfirmationDialog
      confirmationValue={agentName}
      confirmationPlaceholder={agentName}
      dialogId={DELETE_AGENT_MODAL_ID}
      title={t`Delete Agent`}
      subtitle={
        <Trans>
          This action cannot be undone. This will permanently delete your agent.
          <br />
          Please type in the agent name to confirm.
        </Trans>
      }
      onConfirmClick={handleDelete}
      confirmButtonText={t`Delete Agent`}
    />
  );
};
