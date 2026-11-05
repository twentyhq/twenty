import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsMcpServerConnectionProviderSelect } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionProviderSelect';
import { SettingsMcpServerTextFieldSection } from '@/settings/mcp-servers/components/SettingsMcpServerTextFieldSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type McpServer } from '~/generated-metadata/graphql';

type SettingsMcpServerFormFieldsProps = {
  mcpServer?: Pick<McpServer, 'id' | 'applicationId'>;
};

export const SettingsMcpServerFormFields = ({
  mcpServer,
}: SettingsMcpServerFormFieldsProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNewMcpServer = !isDefined(mcpServer);
  const instanceIdPrefix = mcpServer?.id ?? 'new-mcp-server';
  const connectionProviderApplicationId =
    mcpServer?.applicationId ??
    currentWorkspace?.workspaceCustomApplication?.id;

  return (
    <>
      <SettingsMcpServerTextFieldSection
        name="label"
        instanceId={`${instanceIdPrefix}-label`}
        title={t`Label`}
        description={t`The name shown to your team and to agents.`}
        placeholder={t`Linear`}
        autoFocus={isNewMcpServer}
      />
      <SettingsMcpServerTextFieldSection
        name="name"
        instanceId={`${instanceIdPrefix}-name`}
        title={t`Name`}
        description={t`Identifier prefixed to the tool names exposed to agents. Lowercase letters, digits and underscores; cannot be changed later.`}
        placeholder={t`linear`}
        disabled={!isNewMcpServer}
      />
      <SettingsMcpServerTextFieldSection
        name="url"
        instanceId={`${instanceIdPrefix}-url`}
        title={t`URL`}
        description={t`The HTTP endpoint of the remote MCP server.`}
        placeholder={t`https://mcp.example.com/mcp`}
      />
      {isDefined(connectionProviderApplicationId) && (
        <Section.Root>
          <Section.Header
            title={t`Connection provider`}
            description={t`Optional provider whose connected account authenticates calls to this server.`}
          />
          <SettingsMcpServerConnectionProviderSelect
            applicationId={connectionProviderApplicationId}
          />
        </Section.Root>
      )}
    </>
  );
};
