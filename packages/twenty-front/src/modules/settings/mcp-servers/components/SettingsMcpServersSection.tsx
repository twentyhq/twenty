import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';

import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { SettingsMcpServersTable } from '@/settings/mcp-servers/components/SettingsMcpServersTable';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SettingsMcpServersSection = () => {
  const { t } = useLingui();
  const isMcpServersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
  );
  const canManageMcpServers = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  if (!isMcpServersEnabled || !canManageMcpServers) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`MCP servers`}
        description={t`Connect remote MCP servers so agents can use their tools`}
      />
      <SettingsMcpServersTable />
      <TableFooter>
        <NavigationButton
          startIcon={<IconPlus />}
          size="sm"
          to={getSettingsPath(SettingsPath.AiNewMcpServer)}
          variant="outline"
        >{t`Add MCP server`}</NavigationButton>
      </TableFooter>
    </Section.Root>
  );
};
