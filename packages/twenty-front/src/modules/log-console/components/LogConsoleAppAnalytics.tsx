import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useRefetchOnApplicationRegistrationChange } from '@/applications/hooks/useRefetchOnApplicationRegistrationChange';
import { LogConsoleAppAnalyticsReport } from '@/log-console/components/LogConsoleAppAnalyticsReport';
import { logConsoleAppAnalyticsPeriodState } from '@/log-console/states/logConsoleAppAnalyticsPeriodState';
import { logConsoleAppAnalyticsRegistrationIdState } from '@/log-console/states/logConsoleAppAnalyticsRegistrationIdState';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { Select } from '@/ui/input/components/Select';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { FindManyApplicationRegistrationsDocument } from '~/generated-metadata/graphql';

const LOG_CONSOLE_APP_ANALYTICS_SCROLL_WRAPPER_ID = 'log-console-app-analytics';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${APP_HEADER_HEIGHT}px;
  justify-content: space-between;
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledContent = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

export const LogConsoleAppAnalytics = () => {
  const { t } = useLingui();
  const [
    logConsoleAppAnalyticsRegistrationId,
    setLogConsoleAppAnalyticsRegistrationId,
  ] = useAtomState(logConsoleAppAnalyticsRegistrationIdState);
  const [logConsoleAppAnalyticsPeriod, setLogConsoleAppAnalyticsPeriod] =
    useAtomState(logConsoleAppAnalyticsPeriodState);

  const { data, loading, refetch } = useQuery(
    FindManyApplicationRegistrationsDocument,
  );

  useRefetchOnApplicationRegistrationChange({ refetch });

  const registrations = data?.findManyApplicationRegistrations ?? [];

  const selectedRegistration =
    registrations.find(
      (registration) =>
        registration.id === logConsoleAppAnalyticsRegistrationId,
    ) ?? registrations[0];

  if (loading && !isDefined(data)) {
    return null;
  }

  if (!isDefined(selectedRegistration)) {
    return (
      <SettingsEmptyPlaceholder>
        {t`No app registered yet. Analytics appear here for the apps this workspace develops.`}
      </SettingsEmptyPlaceholder>
    );
  }

  return (
    <StyledContainer>
      <StyledToolbar>
        <Select
          dropdownId="log-console-app-analytics-registration"
          aria-label={t`App`}
          value={selectedRegistration.id}
          options={registrations.map((registration) => ({
            value: registration.id,
            label: registration.name,
          }))}
          onChange={setLogConsoleAppAnalyticsRegistrationId}
          dropdownWidth={GenericDropdownContentWidth.Large}
          selectSizeVariant="small"
          withSearchInput={registrations.length > 5}
          needIconCheck
        />
        <Select
          dropdownId="log-console-app-analytics-period"
          aria-label={t`Period`}
          value={logConsoleAppAnalyticsPeriod}
          options={getPeriodOptions()}
          onChange={setLogConsoleAppAnalyticsPeriod}
          selectSizeVariant="small"
          needIconCheck
        />
      </StyledToolbar>
      <ScrollWrapper
        componentInstanceId={LOG_CONSOLE_APP_ANALYTICS_SCROLL_WRAPPER_ID}
      >
        <StyledContent>
          <LogConsoleAppAnalyticsReport
            key={selectedRegistration.id}
            applicationRegistrationId={selectedRegistration.id}
            period={logConsoleAppAnalyticsPeriod}
          />
        </StyledContent>
      </ScrollWrapper>
    </StyledContainer>
  );
};
