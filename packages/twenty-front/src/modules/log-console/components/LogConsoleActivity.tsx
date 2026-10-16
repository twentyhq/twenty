import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ResponsiveLine } from '@nivo/line';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { IconChevronRight, IconX } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { GET_APPLICATION_LOG_ACTIVITY } from '@/settings/event-logs/graphql/queries/getApplicationLogActivity';
import {
  type ApplicationLogActivityQuery,
  type EventLogQueryInput,
} from '~/generated-metadata/graphql';

const StyledActivity = styled(Collapsible.Root)`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;
const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  padding-inline: ${themeCssVariables.spacing[3]};
`;
const StyledTrigger = styled(Collapsible.Trigger)`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0;
  &[data-panel-open] svg {
    transform: rotate(90deg);
  }
`;
const StyledTooltip = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;
const StyledSelection = styled.div`
  margin-left: auto;
`;
const StyledChart = styled.div`
  height: 156px;
  padding-inline: ${themeCssVariables.spacing[3]};
`;
const StyledMessage = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: 100%;
  justify-content: center;
`;

export type LogConsoleActivitySelection = { start: string; end: string };

type LogConsoleActivityProps = {
  input: EventLogQueryInput;
  isPaused: boolean;
  isLive: boolean;
  selection?: LogConsoleActivitySelection;
  onSelectionChange: (selection?: LogConsoleActivitySelection) => void;
};

export const LogConsoleActivity = ({
  input,
  isPaused,
  isLive,
  selection,
  onSelectionChange,
}: LogConsoleActivityProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const timeZone = useLogConsoleTimeZone();
  const [isOpen, setIsOpen] = useState(true);
  const { data, loading, error } = useQuery<ApplicationLogActivityQuery>(
    GET_APPLICATION_LOG_ACTIVITY,
    {
      variables: { input: { ...input, first: 1, includeActivity: true } },
      fetchPolicy: 'network-only',
      skip: !isOpen,
      pollInterval: isLive && !isPaused && isOpen ? 15000 : 0,
    },
  );
  const buckets = data?.eventLogs.activity ?? [];
  const series = [
    { id: t`Info`, key: 'info' as const, color: theme.color.blue },
    { id: t`Warning`, key: 'warning' as const, color: theme.color.orange },
    { id: t`Error`, key: 'error' as const, color: theme.color.red },
  ];
  const formatTime = (value: string) =>
    formatInTimeZone(new Date(value), timeZone, 'MMM d, HH:mm');
  return (
    <StyledActivity open={isOpen} onOpenChange={setIsOpen}>
      <StyledHeader>
        <StyledTrigger>
          <IconChevronRight size={14} />
          {t`Activity`}
        </StyledTrigger>
        {selection && (
          <StyledSelection>
            <LightButton
              size="sm"
              endIcon={<IconX size={14} />}
              aria-label={t`Clear time selection`}
              onClick={() => onSelectionChange(undefined)}
            >{`${formatTime(selection.start)} – ${formatTime(selection.end)}`}</LightButton>
          </StyledSelection>
        )}
      </StyledHeader>
      <Collapsible.Panel dimension="height" containAnimation>
        <StyledChart>
          {error ? (
            <StyledMessage>{t`Could not load activity`}</StyledMessage>
          ) : loading && !data ? (
            <StyledMessage>{t`Loading`}</StyledMessage>
          ) : buckets.length === 0 ? (
            <StyledMessage>{t`No event logs found`}</StyledMessage>
          ) : (
            <ResponsiveLine
              data={series.map(({ id, key }) => ({
                id,
                data: buckets.map((bucket, index) => ({
                  x: index,
                  y: bucket[key],
                })),
              }))}
              colors={series.map(({ color }) => color)}
              margin={{ top: 24, right: 16, bottom: 28, left: 32 }}
              xScale={{
                type: 'linear',
                min: 0,
                max: Math.max(1, buckets.length - 1),
              }}
              yScale={{
                type: 'linear',
                min: 0,
                max:
                  Math.max(
                    1,
                    ...buckets.flatMap(({ info, warning, error }) => [
                      info,
                      warning,
                      error,
                    ]),
                  ) * 1.1,
              }}
              axisBottom={{
                tickValues: 5,
                tickSize: 0,
                tickPadding: 8,
                format: (value) =>
                  buckets[Math.round(Number(value))]
                    ? formatInTimeZone(
                        new Date(buckets[Math.round(Number(value))].start),
                        timeZone,
                        'HH:mm',
                      )
                    : '',
              }}
              axisLeft={{
                tickValues: 3,
                tickSize: 0,
                tickPadding: 8,
                format: (value) =>
                  Number.isInteger(Number(value)) ? String(value) : '',
              }}
              enableGridX={false}
              enablePoints={false}
              useMesh
              enableArea
              areaOpacity={0.04}
              animate={false}
              ariaLabel={t`Application log activity`}
              markers={
                selection
                  ? [
                      {
                        axis: 'x',
                        value: buckets.findIndex(
                          ({ start }) => start === selection.start,
                        ),
                        lineStyle: {
                          stroke: theme.color.blue,
                          strokeWidth: 1,
                          strokeDasharray: '4 4',
                        },
                      },
                    ]
                  : []
              }
              onClick={(point) => {
                if (!('data' in point)) return;
                const bucket = buckets[Number(point.data.x)];
                if (bucket)
                  onSelectionChange({ start: bucket.start, end: bucket.end });
              }}
              tooltip={({ point }) => (
                <StyledTooltip>
                  {formatTime(buckets[Number(point.data.x)].start)} ·{' '}
                  {point.seriesId}: {point.data.yFormatted}
                </StyledTooltip>
              )}
              theme={{
                text: {
                  fill: theme.font.color.tertiary,
                  fontSize: theme.font.size.sm,
                  fontFamily: theme.font.family,
                },
                grid: { line: { stroke: theme.border.color.light } },
                axis: { ticks: { text: { fill: theme.font.color.tertiary } } },
              }}
              legends={[
                {
                  anchor: 'top-right',
                  direction: 'row',
                  translateY: -24,
                  itemWidth: 84,
                  itemHeight: 16,
                  symbolSize: 4,
                  symbolShape: 'circle',
                  itemTextColor: theme.font.color.secondary,
                },
              ]}
            />
          )}
        </StyledChart>
      </Collapsible.Panel>
    </StyledActivity>
  );
};
