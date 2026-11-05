import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SettingsMcpServerToolsTable } from '@/settings/mcp-servers/components/SettingsMcpServerToolsTable';
import { useSyncMcpServerTools } from '@/settings/mcp-servers/hooks/useSyncMcpServerTools';
import { type McpServerFragmentFragment } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type SettingsMcpServerToolsSectionProps = {
  mcpServer: Pick<
    McpServerFragmentFragment,
    'id' | 'tools' | 'toolsSyncedAt' | 'toolsSyncError'
  >;
};

export const SettingsMcpServerToolsSection = ({
  mcpServer,
}: SettingsMcpServerToolsSectionProps) => {
  const { t } = useLingui();
  const { syncMcpServerTools, isSyncingMcpServerTools } =
    useSyncMcpServerTools();

  const getDescription = () => {
    if (isNonEmptyString(mcpServer.toolsSyncError)) {
      return t`Last sync failed: ${mcpServer.toolsSyncError}`;
    }

    if (isDefined(mcpServer.toolsSyncedAt)) {
      const lastSynced = beautifyPastDateRelativeToNow(mcpServer.toolsSyncedAt);

      return t`Last synced ${lastSynced}`;
    }

    return t`Tools have not been synced yet`;
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Tools`}
        description={getDescription()}
        actions={
          <Button
            startIcon={<IconRefresh />}
            variant="outline"
            size="sm"
            loading={isSyncingMcpServerTools}
            disabled={isSyncingMcpServerTools}
            onClick={() => syncMcpServerTools(mcpServer.id)}
          >{t`Sync tools`}</Button>
        }
      />
      <SettingsMcpServerToolsTable tools={mcpServer.tools} />
    </Section.Root>
  );
};
