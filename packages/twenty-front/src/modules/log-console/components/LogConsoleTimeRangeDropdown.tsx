import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
} from 'twenty-ui/icon';
import { Button, SegmentedControl } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { type LogConsoleTimeRangePreset } from '@/log-console/types/LogConsoleTimeRangePreset';
import { getLogConsoleTimeRangeBounds } from '@/log-console/utils/getLogConsoleTimeRangeBounds';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { DATE_PICKER_CONTAINER_WIDTH } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID = 'log-console-time-range';

const StyledRetention = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledCustomRangeCalendar = styled.div`
  min-height: 0;
  overflow-y: auto;
`;

const StyledCustomRangeActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

type CustomRange = {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

type LogConsoleTimeRangeDropdownProps = {
  source: LogConsoleSource;
  timeRange: LogConsoleTimeRange;
  onTimeRangeChange: (timeRange: LogConsoleTimeRange) => void;
};

export const LogConsoleTimeRangeDropdown = ({
  source,
  timeRange,
  onTimeRangeChange,
}: LogConsoleTimeRangeDropdownProps) => {
  const { t } = useLingui();
  const timeZone = useLogConsoleTimeZone();
  const {
    timeZone: memberTimeZone,
    dateFormat,
    timeFormat,
  } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { retentionInDays, retentionDescription } =
    useLogConsoleRetention(source);
  const [logConsoleTimeZone, setLogConsoleTimeZone] = useAtomState(
    logConsoleTimeZoneState,
  );
  const { closeDropdown } = useCloseDropdown();
  const navigateSettings = useNavigateSettings();
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [editedCustomRangeBound, setEditedCustomRangeBound] =
    useState<keyof CustomRange>('start');

  const getTimeRangeLabel = (labeledTimeRange: LogConsoleTimeRange) => {
    if (!isString(labeledTimeRange)) {
      return t`Custom range`;
    }

    if (labeledTimeRange === 'today') {
      return t`Today`;
    }

    if (labeledTimeRange === 'yesterday') {
      return t`Yesterday`;
    }

    return t(LOG_CONSOLE_TIME_RANGE_PRESETS[labeledTimeRange].label);
  };

  const selectTimeRange = (selectedTimeRange: LogConsoleTimeRange) => {
    onTimeRangeChange(selectedTimeRange);
    closeDropdown(LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID);
  };

  const openCustomRange = () => {
    const now = new Date().toISOString();
    const { start, end = now } = getLogConsoleTimeRangeBounds({
      timeRange,
      now,
      timeZone,
    });

    setEditedCustomRangeBound('start');
    setCustomRange({
      start: Temporal.Instant.from(start).toZonedDateTimeISO(timeZone),
      end: Temporal.Instant.from(end).toZonedDateTimeISO(timeZone),
    });
  };

  const openRetentionSettings = () => {
    closeDropdown(LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID);
    navigateSettings(SettingsPath.Security);
  };

  const renderTimeRangeItem = (
    itemTimeRange: LogConsoleTimeRangePreset | 'today' | 'yesterday',
  ) => {
    const isWithinRetention = isLogConsoleTimeRangeWithinRetention({
      timeRange: itemTimeRange,
      retentionInDays,
    });

    return (
      <Tooltip
        key={itemTimeRange}
        content={retentionDescription}
        disabled={isWithinRetention}
        side="right"
      >
        <ListItem
          role="option"
          aria-selected={itemTimeRange === timeRange}
          selected={itemTimeRange === timeRange}
          indicator="check"
          disabled={!isWithinRetention}
          onClick={() => selectTimeRange(itemTimeRange)}
        >
          {getTimeRangeLabel(itemTimeRange)}
        </ListItem>
      </Tooltip>
    );
  };

  const renderCustomRangeBound = (
    customRangeDraft: CustomRange,
    bound: keyof CustomRange,
    label: string,
  ) => (
    <ListItem
      selected={bound === editedCustomRangeBound}
      description={formatDateISOStringToDateTime({
        date: customRangeDraft[bound].toInstant().toString(),
        timeZone,
        dateFormat,
        timeFormat,
        localeCatalog,
      })}
      descriptionPlacement="end"
      onClick={() => setEditedCustomRangeBound(bound)}
    >
      {label}
    </ListItem>
  );

  const renderCustomRange = (customRangeDraft: CustomRange) => (
    <LegacyDropdownContent widthInPixels={DATE_PICKER_CONTAINER_WIDTH}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setCustomRange(null)}
            Icon={IconChevronLeft}
          />
        }
        EndComponent={timeZone}
      >
        {t`Custom range`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer scrollable={false}>
        {renderCustomRangeBound(customRangeDraft, 'start', t`From`)}
        {renderCustomRangeBound(customRangeDraft, 'end', t`To`)}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <StyledCustomRangeCalendar>
        <DateTimePicker
          key={editedCustomRangeBound}
          instanceId="log-console-custom-time-range"
          date={customRangeDraft[editedCustomRangeBound]}
          onChange={(date) =>
            setCustomRange({
              ...customRangeDraft,
              [editedCustomRangeBound]:
                date ?? customRangeDraft[editedCustomRangeBound],
            })
          }
          onClose={() => setEditedCustomRangeBound('end')}
          clearable={false}
          hideHeaderInput
          timeZone={timeZone}
        />
      </StyledCustomRangeCalendar>
      <DropdownMenuSeparator />
      <StyledCustomRangeActions>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => closeDropdown(LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID)}
        >
          {t`Cancel`}
        </Button>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={
            Temporal.ZonedDateTime.compare(
              customRangeDraft.start,
              customRangeDraft.end,
            ) >= 0
          }
          onClick={() =>
            selectTimeRange({
              start: customRangeDraft.start.toInstant().toString(),
              end: customRangeDraft.end.toInstant().toString(),
            })
          }
        >
          {t`Apply`}
        </Button>
      </StyledCustomRangeActions>
    </LegacyDropdownContent>
  );

  const renderMenu = () => (
    <LegacyDropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      <DropdownMenuItemsContainer>
        {typedObjectEntries(LOG_CONSOLE_TIME_RANGE_PRESETS).map(([preset]) =>
          renderTimeRangeItem(preset),
        )}
        <DropdownMenuSeparator />
        {renderTimeRangeItem('today')}
        {renderTimeRangeItem('yesterday')}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <ListItem hasSubmenu onClick={openCustomRange}>
          {t`Custom range...`}
        </ListItem>
        <DropdownMenuSeparator />
        <StyledRetention>{retentionDescription}</StyledRetention>
        {source.requiresAuditLogs && (
          <ListItem onClick={openRetentionSettings}>
            {t`Change retention`}
          </ListItem>
        )}
        <DropdownMenuSeparator />
        <SegmentedControl
          aria-label={t`Time zone`}
          value={logConsoleTimeZone}
          onValueChange={setLogConsoleTimeZone}
          options={[
            { value: 'member', label: memberTimeZone },
            { value: 'utc', label: 'UTC' },
          ]}
        />
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );

  return (
    <Dropdown
      dropdownId={LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      dropdownOffset={{ y: 8 }}
      onClose={() => setCustomRange(null)}
      clickableComponent={
        <Button
          size="sm"
          startIcon={<IconCalendarEvent />}
          endIcon={<IconChevronDown />}
        >
          {getTimeRangeLabel(timeRange)}
        </Button>
      }
      dropdownComponents={
        isDefined(customRange) ? renderCustomRange(customRange) : renderMenu()
      }
    />
  );
};
