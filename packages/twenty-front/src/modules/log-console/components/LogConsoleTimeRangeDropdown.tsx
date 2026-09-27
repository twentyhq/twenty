import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { typedObjectEntries } from 'twenty-shared/utils';
import { IconCalendarEvent, IconChevronDown } from 'twenty-ui/icon';
import { Button, SegmentedControl } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { useLogConsoleRetention } from '@/log-console/hooks/useLogConsoleRetention';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const LOG_CONSOLE_TIME_RANGE_DROPDOWN_ID = 'log-console-time-range';

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
  const { timeZone: memberTimeZone } = useDateTimeFormat();
  const { retentionInDays, retentionDescription } =
    useLogConsoleRetention(source);
  const [logConsoleTimeZone, setLogConsoleTimeZone] = useAtomState(
    logConsoleTimeZoneState,
  );
  const { closeDropdown } = useCloseDropdown();
  const navigateSettings = useNavigateSettings();

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
      dropdownComponents={
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
            <ListItem
              description={plural(retentionInDays, {
                one: '# day',
                other: '# days',
              })}
              descriptionPlacement="end"
              disabled={!source.requiresAuditLogs}
              onClick={openRetentionSettings}
            >
              {t`Retention`}
            </ListItem>
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
      }
    />
  );
};
