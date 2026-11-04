import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconInfoCircle } from 'twenty-ui/icon';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

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
  justify-content: space-between;
`;

const StyledInfoIcon = styled(IconInfoCircle)`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: default;
  flex-shrink: 0;
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

type ApplicationMonitoringKpi = {
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
      label: t`Function runs`,
      value: formattedRunCount,
      description: t`Logic function runs across every install in this period`,
      isAlert: false,
    },
    {
      label: t`Failed runs`,
      value: i18n.number(failedRunShare, {
        style: 'percent',
        maximumFractionDigits: 1,
      }),
      description: t`${formattedFailedRunCount} of ${formattedRunCount} runs failed`,
      isAlert: monitoring.failedRunCount > 0,
    },
    {
      label: t`Lifecycle failures`,
      value: i18n.number(monitoring.lifecycleFailureCount),
      description: t`Failed installs, upgrades and uninstalls`,
      isAlert: monitoring.lifecycleFailureCount > 0,
    },
    {
      label: t`Rate limited`,
      value: i18n.number(monitoring.rateLimitEventCount),
      description: t`API requests rejected and trigger jobs skipped because the app hit a rate limit`,
      isAlert: false,
    },
  ];

  return (
    <StyledKpis>
      {kpis.map(({ label, value, description, isAlert }) => (
        <Card.Root
          key={label}
          backgroundColor={themeCssVariables.background.secondary}
        >
          <StyledKpi>
            <StyledKpiLabel>
              {label}
              <Tooltip
                content={description}
                arrow
                side="top"
                delay={TooltipDelay.shortDelay}
                positionMethod="fixed"
              >
                <StyledInfoIcon
                  aria-label={description}
                  size={theme.icon.size.sm}
                />
              </Tooltip>
            </StyledKpiLabel>
            <StyledKpiValue isAlert={isAlert}>{value}</StyledKpiValue>
          </StyledKpi>
        </Card.Root>
      ))}
    </StyledKpis>
  );
};
