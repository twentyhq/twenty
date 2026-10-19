import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  IconAlertTriangle,
  IconBrandTypescript,
  IconDownload,
  IconGauge,
  type IconComponent,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';

const StyledKpis = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
`;

const StyledKpi = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledKpiLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledKpiValue = styled.div<{ isAlert: boolean }>`
  color: ${({ isAlert }) =>
    isAlert
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledKpiDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ApplicationMonitoringKpi = {
  Icon: IconComponent;
  label: string;
  value: string;
  description: string;
  isAlert: boolean;
};

type ApplicationMonitoringKpisProps = {
  monitoring: Pick<
    ApplicationMonitoringData,
    | 'runCount'
    | 'failedRunCount'
    | 'lifecycleFailureCount'
    | 'rateLimitEventCount'
  >;
};

export const ApplicationMonitoringKpis = ({
  monitoring,
}: ApplicationMonitoringKpisProps) => {
  const { t, i18n } = useLingui();
  const theme = useTheme();

  const failedRunShare =
    monitoring.runCount > 0
      ? monitoring.failedRunCount / monitoring.runCount
      : 0;
  const formattedRunCount = i18n.number(monitoring.runCount);
  const formattedFailedRunCount = i18n.number(monitoring.failedRunCount);

  const kpis: ApplicationMonitoringKpi[] = [
    {
      Icon: IconBrandTypescript,
      label: t`Function runs`,
      value: formattedRunCount,
      description: t`Across every install`,
      isAlert: false,
    },
    {
      Icon: IconAlertTriangle,
      label: t`Failed runs`,
      value: i18n.number(failedRunShare, {
        style: 'percent',
        maximumFractionDigits: 1,
      }),
      description: t`${formattedFailedRunCount} of ${formattedRunCount} runs`,
      isAlert: monitoring.failedRunCount > 0,
    },
    {
      Icon: IconDownload,
      label: t`Lifecycle failures`,
      value: i18n.number(monitoring.lifecycleFailureCount),
      description: t`Installs, upgrades and uninstalls`,
      isAlert: monitoring.lifecycleFailureCount > 0,
    },
    {
      Icon: IconGauge,
      label: t`Rate limit events`,
      value: i18n.number(monitoring.rateLimitEventCount),
      description: t`At most one per minute per install`,
      isAlert: false,
    },
  ];

  return (
    <StyledKpis>
      {kpis.map(({ Icon, label, value, description, isAlert }) => (
        <Card.Root
          key={label}
          backgroundColor={themeCssVariables.background.secondary}
        >
          <StyledKpi>
            <StyledKpiLabel>
              <Icon size={theme.icon.size.sm} />
              {label}
            </StyledKpiLabel>
            <StyledKpiValue isAlert={isAlert}>{value}</StyledKpiValue>
            <StyledKpiDescription>{description}</StyledKpiDescription>
          </StyledKpi>
        </Card.Root>
      ))}
    </StyledKpis>
  );
};
