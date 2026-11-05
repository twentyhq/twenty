import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPower } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsMcpServerConnectionProviderSelect } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionProviderSelect';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type McpServer } from '~/generated-metadata/graphql';

type SettingsMcpServerFormFieldsProps = {
  mcpServer?: Pick<McpServer, 'id' | 'applicationId'>;
};

export const SettingsMcpServerFormFields = ({
  mcpServer,
}: SettingsMcpServerFormFieldsProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<McpServerFormValues>();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNewMcpServer = !isDefined(mcpServer);
  const instanceIdPrefix = mcpServer?.id ?? 'new-mcp-server';
  const connectionProviderApplicationId =
    mcpServer?.applicationId ??
    currentWorkspace?.workspaceCustomApplication?.id;

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Label`}
          description={t`The name shown to your team and to agents.`}
        />
        <Controller
          name="label"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <SettingsTextInput
              instanceId={`${instanceIdPrefix}-label`}
              placeholder={t`Linear`}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error?.message}
              fullWidth
              autoFocus={isNewMcpServer}
            />
          )}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Name`}
          description={t`Identifier prefixed to the tool names exposed to agents. Lowercase letters, digits and underscores; cannot be changed later.`}
        />
        <Controller
          name="name"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <SettingsTextInput
              instanceId={`${instanceIdPrefix}-name`}
              placeholder={t`linear`}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error?.message}
              disabled={!isNewMcpServer}
              fullWidth
            />
          )}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`URL`}
          description={t`The HTTP endpoint of the remote MCP server.`}
        />
        <Controller
          name="url"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <SettingsTextInput
              instanceId={`${instanceIdPrefix}-url`}
              placeholder={t`https://mcp.example.com/mcp`}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error?.message}
              fullWidth
            />
          )}
        />
      </Section.Root>
      {isDefined(connectionProviderApplicationId) && (
        <Section.Root>
          <Section.Header
            title={t`Connection provider`}
            description={t`Optional provider whose connected account authenticates calls to this server.`}
          />
          <Controller
            name="connectionProviderId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsMcpServerConnectionProviderSelect
                applicationId={connectionProviderApplicationId}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </Section.Root>
      )}
      <Section.Root>
        <Section.Header
          title={t`Status`}
          description={t`Inactive servers keep their settings but their tools are not offered to agents.`}
        />
        <Controller
          name="isActive"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Card.Root>
              <SettingsOptionCardContentSwitch
                Icon={IconPower}
                title={t`Active`}
                checked={value}
                onChange={onChange}
              />
            </Card.Root>
          )}
        />
      </Section.Root>
    </>
  );
};
