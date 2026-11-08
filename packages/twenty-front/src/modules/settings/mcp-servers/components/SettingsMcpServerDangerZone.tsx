import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconArchive, IconArchiveOff, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { DELETE_MCP_SERVER_DIALOG_ID } from '@/settings/mcp-servers/constants/DeleteMcpServerDialogId';
import { useDeleteMcpServer } from '@/settings/mcp-servers/hooks/useDeleteMcpServer';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import { useUpdateMcpServer } from '@/settings/mcp-servers/hooks/useUpdateMcpServer';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type McpServer } from '~/generated-metadata/graphql';

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsMcpServerDangerZoneProps = {
  mcpServer: Pick<McpServer, 'id' | 'isActive' | 'applicationId'>;
};

export const SettingsMcpServerDangerZone = ({
  mcpServer,
}: SettingsMcpServerDangerZoneProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const { deleteMcpServer } = useDeleteMcpServer();
  const { updateMcpServer, isUpdatingMcpServer } = useUpdateMcpServer();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const toggleActive = async () => {
    const updatedMcpServer = await updateMcpServer({
      mcpServerId: mcpServer.id,
      update: { isActive: !mcpServer.isActive },
    });

    if (isDefined(updatedMcpServer)) {
      navigateToMcpServersList();
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Danger zone`}
        description={t`Deactivate or delete this MCP server`}
      />
      <StyledDangerButtonsContainer>
        <Button
          startIcon={mcpServer.isActive ? <IconArchive /> : <IconArchiveOff />}
          size="sm"
          disabled={isUpdatingMcpServer}
          onClick={toggleActive}
        >
          {mcpServer.isActive ? t`Deactivate` : t`Activate`}
        </Button>
        {getIsMetadataItemCustom(mcpServer) && (
          <Button
            startIcon={<IconTrash />}
            size="sm"
            onClick={() => openDialog(DELETE_MCP_SERVER_DIALOG_ID)}
            variant="outline"
            color="danger"
          >{t`Delete`}</Button>
        )}
      </StyledDangerButtonsContainer>
      <ConfirmationDialog
        dialogId={DELETE_MCP_SERVER_DIALOG_ID}
        title={t`Delete MCP server`}
        subtitle={t`Are you sure you want to delete this MCP server? This action cannot be undone.`}
        onConfirmClick={() => deleteMcpServer(mcpServer.id)}
        confirmButtonText={t`Delete`}
      />
    </Section.Root>
  );
};
