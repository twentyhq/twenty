import { useLingui } from '@lingui/react/macro';

import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { useSetAdvancedMode } from '@/navigation/hooks/useSetAdvancedMode';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { IconHistory, IconTerminal } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

export const SettingsOpenLogConsoleCard = () => {
  const { t } = useLingui();
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const { setAdvancedMode } = useSetAdvancedMode();
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );

  const openLogConsole = () => {
    if (!isAdvancedModeEnabled) {
      setAdvancedMode(true);
      return;
    }

    setIsLogConsoleFullScreen(false);
    setLogConsoleDisplayMode('open');
  };

  return (
    <Card.Root rounded>
      <SettingsOptionCardContentButton
        Icon={IconHistory}
        title={t`Log console`}
        description={t`Browse record changes, security events, app logs and more`}
        Button={
          <Button
            size="sm"
            startIcon={<IconTerminal />}
            onClick={openLogConsole}
            variant="outline"
          >
            {t`Open log console`}
          </Button>
        }
      />
    </Card.Root>
  );
};
