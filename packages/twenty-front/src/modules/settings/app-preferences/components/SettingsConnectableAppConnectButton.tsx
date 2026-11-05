import { SettingsConnectableAppConnectTooltip } from '@/settings/app-preferences/components/SettingsConnectableAppConnectTooltip';
import { useConnectableAppConnectLink } from '@/settings/app-preferences/hooks/useConnectableAppConnectLink';
import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlug } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type SettingsConnectableAppConnectButtonProps = {
  connectableApp: Pick<ConnectableApp, 'name' | 'connectUrl'>;
};

export const SettingsConnectableAppConnectButton = ({
  connectableApp,
}: SettingsConnectableAppConnectButtonProps) => {
  const { t } = useLingui();
  const connectLink = useConnectableAppConnectLink(connectableApp);

  return (
    <SettingsConnectableAppConnectTooltip
      appName={connectableApp.name}
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
    </SettingsConnectableAppConnectTooltip>
  );
};
