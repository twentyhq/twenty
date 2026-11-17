import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

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
      {isNonEmptyString(mcpServer.toolsSyncError) && (
        <InlineBanner
          status="error"
          icon={<IconAlertTriangle aria-hidden="true" />}
        >
          <OverflowingTextWithTooltip
            text={t`Last sync failed: ${mcpServer.toolsSyncError}`}
          />
        </InlineBanner>
      )}
      <SettingsMcpServerToolsTable tools={mcpServer.tools} />
    </Section.Root>
  );
};
