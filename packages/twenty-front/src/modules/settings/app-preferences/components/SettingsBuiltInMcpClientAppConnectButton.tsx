import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { getBuiltInMcpClientAppConnectLink } from '@/settings/mcp/utils/getBuiltInMcpClientAppConnectLink';
import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlug } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type SettingsBuiltInMcpClientAppConnectButtonProps = {
  builtInMcpClientApp: BuiltInMcpClientApp;
};

export const SettingsBuiltInMcpClientAppConnectButton = ({
  builtInMcpClientApp,
}: SettingsBuiltInMcpClientAppConnectButtonProps) => {
  const { t } = useLingui();
  const appName = t(builtInMcpClientApp.name);
  const connectLink = getBuiltInMcpClientAppConnectLink({
    builtInMcpClientAppId: builtInMcpClientApp.id,
    mcpServerUrl: buildMcpServerUrl(REACT_APP_SERVER_BASE_URL),
  });

  return (
    <Tooltip
      content={t`${appName} needs this server to use HTTPS.`}
      side="bottom"
      positionMethod="fixed"
      delay={TooltipDelay.shortDelay}
      disabled={isDefined(connectLink)}
    >
      <span>
        <Button
          startIcon={<IconPlug />}
          variant="solid"
          color="accent"
          size="sm"
          disabled={!isDefined(connectLink)}
          onClick={() => isDefined(connectLink) && openUrlInNewTab(connectLink)}
        >{t`Connect`}</Button>
      </span>
    </Tooltip>
  );
};
