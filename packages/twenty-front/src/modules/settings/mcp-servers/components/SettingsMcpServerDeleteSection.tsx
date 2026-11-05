import { Trans, useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { DELETE_MCP_SERVER_DIALOG_ID } from '@/settings/mcp-servers/constants/DeleteMcpServerDialogId';
import { useDeleteMcpServer } from '@/settings/mcp-servers/hooks/useDeleteMcpServer';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

type SettingsMcpServerDeleteSectionProps = {
  mcpServerId: string;
};

export const SettingsMcpServerDeleteSection = ({
  mcpServerId,
}: SettingsMcpServerDeleteSectionProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { deleteMcpServer } = useDeleteMcpServer();

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Danger zone`}
          description={t`Delete this MCP server`}
        />
        <Button
          startIcon={<IconTrash />}
          onClick={() => openDialog(DELETE_MCP_SERVER_DIALOG_ID)}
          variant="outline"
          color="danger"
        >{t`Delete`}</Button>
      </Section.Root>
      <ConfirmationDialog
        confirmationPlaceholder={t`yes`}
        confirmationValue={t`yes`}
        dialogId={DELETE_MCP_SERVER_DIALOG_ID}
        title={t`Delete MCP server`}
        subtitle={
          <Trans>
            Please type "yes" to confirm you want to delete this MCP server.
          </Trans>
        }
        onConfirmClick={() => deleteMcpServer(mcpServerId)}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
