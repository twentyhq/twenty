import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { typedObjectEntries } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID = 'log-console-time-range';

type LogConsoleTimeRangeDropdownProps = {
  timeRange: LogConsoleTimeRange;
  onTimeRangeChange: (timeRange: LogConsoleTimeRange) => void;
};

export const LogConsoleTimeRangeDropdown = ({
  timeRange,
  onTimeRangeChange,
}: LogConsoleTimeRangeDropdownProps) => {
  const { t } = useLingui();
  const { timeZone: memberTimeZone } = useDateTimeFormat();
  const {
    retentionInHours,
    retentionLabel,
    retentionDescription,
    isRetentionConfigurable,
  } = useLogConsoleRetention();
  const [logConsoleTimeZone, setLogConsoleTimeZone] = useAtomState(
    logConsoleTimeZoneState,
  );
  const [isTimeZoneMenuOpen, setIsTimeZoneMenuOpen] = useState(false);
  const { closeDropdown } = useCloseDropdown();
  const navigateSettings = useNavigateSettings();

  const timeZoneOptions = [
    { value: 'member', label: memberTimeZone },
    { value: 'utc', label: 'UTC' },
  ] as const;

  const selectedTimeZoneLabel =
    logConsoleTimeZone === 'utc' ? 'UTC' : memberTimeZone;

  const getTimeRangeLabel = (labeledTimeRange: LogConsoleTimeRange) => {
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

  const openRetentionSettings = () => {
    closeDropdown(LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID);
    navigateSettings(SettingsPath.Security);
  };

  const renderTimeRangeItem = (itemTimeRange: LogConsoleTimeRange) => {
    const isWithinRetention = isLogConsoleTimeRangeWithinRetention({
      timeRange: itemTimeRange,
      retentionInHours,
    });

    return (
      <Tooltip
        key={itemTimeRange}
        content={retentionDescription}
        disabled={isWithinRetention}
        side="right"
      >
        <ListItemButton
          role="option"
          aria-selected={itemTimeRange === timeRange}
          selected={itemTimeRange === timeRange}
          indicator="check"
          disabled={!isWithinRetention}
          onClick={() => selectTimeRange(itemTimeRange)}
        >
          {getTimeRangeLabel(itemTimeRange)}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Dropdown
      dropdownId={LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ y: 8 }}
      clickableComponent={
        <Button startIcon={<IconCalendarEvent />} endIcon={<IconChevronDown />}>
          {getTimeRangeLabel(timeRange)}
        </Button>
      }
      onClose={() => setIsTimeZoneMenuOpen(false)}
      dropdownComponents={
        isTimeZoneMenuOpen ? (
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.Large}
          >
            <DropdownMenuHeader
              StartComponent={
                <DropdownMenuHeaderLeftComponent
                  onClick={() => setIsTimeZoneMenuOpen(false)}
                  Icon={IconChevronLeft}
                />
              }
            >
              {t`Time zone`}
            </DropdownMenuHeader>
            <DropdownMenuItemsContainer scrollable={false}>
              {timeZoneOptions.map((timeZoneOption) => (
                <ListItemButton
                  key={timeZoneOption.value}
                  role="option"
                  aria-selected={timeZoneOption.value === logConsoleTimeZone}
                  selected={timeZoneOption.value === logConsoleTimeZone}
                  indicator="check"
                  onClick={() => setLogConsoleTimeZone(timeZoneOption.value)}
                >
                  {timeZoneOption.label}
                </ListItemButton>
              ))}
            </DropdownMenuItemsContainer>
          </LegacyDropdownContent>
        ) : (
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.Large}
          >
            <DropdownMenuItemsContainer>
              {typedObjectEntries(LOG_CONSOLE_TIME_RANGE_PRESETS).map(
                ([preset]) => renderTimeRangeItem(preset),
              )}
              <DropdownMenuSeparator />
              {renderTimeRangeItem('today')}
              {renderTimeRangeItem('yesterday')}
            </DropdownMenuItemsContainer>
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer scrollable={false}>
              <ListItemButton
                description={retentionLabel}
                descriptionPlacement="end"
                disabled={!isRetentionConfigurable}
                onClick={openRetentionSettings}
              >
                {t`Retention`}
              </ListItemButton>
              <ListItemButton
                description={selectedTimeZoneLabel}
                descriptionPlacement="end"
                hasSubmenu
                onClick={() => setIsTimeZoneMenuOpen(true)}
              >
                {t`Time zone`}
              </ListItemButton>
            </DropdownMenuItemsContainer>
          </LegacyDropdownContent>
        )
      }
    />
  );
};
