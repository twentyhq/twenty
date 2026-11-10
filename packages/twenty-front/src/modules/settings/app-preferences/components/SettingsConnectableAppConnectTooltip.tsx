import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsConnectableAppConnectTooltipProps = {
  appName: string;
  isConnectDisabled: boolean;
  children: ReactElement;
};

export const SettingsConnectableAppConnectTooltip = ({
  appName,
  isConnectDisabled,
  children,
}: SettingsConnectableAppConnectTooltipProps) => {
  const { t } = useLingui();

  return (
    <Tooltip
      content={t`${appName} needs this server to use HTTPS.`}
      side="bottom"
      positionMethod="fixed"
      delay={TooltipDelay.shortDelay}
      disabled={!isConnectDisabled}
    >
      {children}
    </Tooltip>
  );
};
