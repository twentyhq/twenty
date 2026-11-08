import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsMcpServerConnectionProviderSelect } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionProviderSelect';
import { SettingsMcpServerTextField } from '@/settings/mcp-servers/components/SettingsMcpServerTextField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type McpServer } from '~/generated-metadata/graphql';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

type SettingsMcpServerFormFieldsProps = {
  mcpServer?: Pick<McpServer, 'id' | 'applicationId' | 'connectionProviderId'>;
};

export const SettingsMcpServerFormFields = ({
  mcpServer,
}: SettingsMcpServerFormFieldsProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNewMcpServer = !isDefined(mcpServer);
  const isUrlLocked = isDefined(mcpServer?.connectionProviderId);
  const instanceIdPrefix = mcpServer?.id ?? 'new-mcp-server';
  const connectionProviderApplicationId =
    mcpServer?.applicationId ??
    currentWorkspace?.workspaceCustomApplication?.id;

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`About`}
          description={t`How this server is named for your team and for agents`}
        />
        <StyledInputsContainer>
          <SettingsMcpServerTextField
            name="label"
            instanceId={`${instanceIdPrefix}-label`}
            label={t`Label`}
            placeholder={t`Linear`}
            autoFocus={isNewMcpServer}
          />
          <SettingsMcpServerTextField
            name="name"
            instanceId={`${instanceIdPrefix}-name`}
            label={t`Name`}
            placeholder={t`linear`}
            hint={t`Prefix of the tool names agents see. Cannot be changed later.`}
            disabled={!isNewMcpServer}
          />
        </StyledInputsContainer>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Connection`}
          description={t`Where the server lives and how calls to it are authenticated`}
        />
        <StyledInputsContainer>
          <SettingsMcpServerTextField
            name="url"
            instanceId={`${instanceIdPrefix}-url`}
            label={t`URL`}
            placeholder={t`https://mcp.example.com/mcp`}
            hint={
              isUrlLocked
                ? t`Remove the connection provider to change the URL.`
                : undefined
            }
            disabled={isUrlLocked}
          />
          {isDefined(connectionProviderApplicationId) && (
            <SettingsMcpServerConnectionProviderSelect
              applicationId={connectionProviderApplicationId}
            />
          )}
        </StyledInputsContainer>
      </Section.Root>
    </>
  );
};
