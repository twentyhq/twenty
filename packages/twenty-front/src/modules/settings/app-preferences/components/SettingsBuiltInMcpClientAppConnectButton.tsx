import { SettingsBuiltInMcpClientAppConnectTooltip } from '@/settings/app-preferences/components/SettingsBuiltInMcpClientAppConnectTooltip';
import { useBuiltInMcpClientAppConnectLink } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppConnectLink';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlug } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type SettingsBuiltInMcpClientAppConnectButtonProps = {
  builtInMcpClientApp: BuiltInMcpClientApp;
};

export const SettingsBuiltInMcpClientAppConnectButton = ({
  builtInMcpClientApp,
}: SettingsBuiltInMcpClientAppConnectButtonProps) => {
  const { t } = useLingui();
  const connectLink = useBuiltInMcpClientAppConnectLink(builtInMcpClientApp);

  return (
    <SettingsBuiltInMcpClientAppConnectTooltip
      appName={t(builtInMcpClientApp.name)}
      isConnectDisabled={!isDefined(connectLink)}
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
    </SettingsBuiltInMcpClientAppConnectTooltip>
  );
};
