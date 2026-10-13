import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsoleResults } from '@/log-console/components/LogConsoleResults';
import { LogConsoleSourceSelect } from '@/log-console/components/LogConsoleSourceSelect';
import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';
import { useLogConsoleSources } from '@/log-console/hooks/useLogConsoleSources';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/constants/SettingsContentMaxWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledUpgradeCardContainer = styled.div`
  box-sizing: border-box;
  margin: auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  padding: 0 ${themeCssVariables.spacing[8]};
  width: 100%;
`;

export const LogConsoleLogs = () => {
  const { t } = useLingui();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);
  const { activeSource, isSourceLocked } = useLogConsoleSources();

  if (!isClickHouseConfigured) {
    return (
      <SettingsEmptyPlaceholder>
        {t`Logs require ClickHouse to be configured. Please contact your administrator.`}
      </SettingsEmptyPlaceholder>
    );
  }

  if (isSourceLocked(activeSource)) {
    return (
      <>
        <LogConsoleToolbarLayout>
          <LogConsoleSourceSelect />
        </LogConsoleToolbarLayout>
        <StyledUpgradeCardContainer>
          <SettingsEnterpriseFeatureGateCard
            title={t`Upgrade to access audit logs`}
            description={t`Record changes and app logs are available on your current plan. Other log types require an Organization subscription.`}
            buttonTitle={t`Upgrade`}
          />
        </StyledUpgradeCardContainer>
      </>
    );
  }

  return <LogConsoleResults key={activeSource.id} source={activeSource} />;
};
