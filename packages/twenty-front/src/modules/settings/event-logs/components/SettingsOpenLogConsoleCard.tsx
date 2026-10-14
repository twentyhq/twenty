import { useLingui } from '@lingui/react/macro';

import { useSetAdvancedMode } from '@/navigation/hooks/useSetAdvancedMode';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { IconHistory, IconTerminal } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

export const SettingsOpenLogConsoleCard = () => {
  const { t } = useLingui();
  const { setAdvancedMode } = useSetAdvancedMode();

  const openLogConsole = () => {
    setAdvancedMode(true);
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
