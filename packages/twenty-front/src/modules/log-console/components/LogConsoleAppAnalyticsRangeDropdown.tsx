import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
} from 'twenty-ui/icon';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS } from '@/log-console/constants/LogConsoleAppAnalyticsRangePresets';
import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';
import { type LogConsoleAppAnalyticsRangePreset } from '@/log-console/types/LogConsoleAppAnalyticsRangePreset';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { DATE_PICKER_CONTAINER_WIDTH } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const LOG_CONSOLE_APP_ANALYTICS_RANGE_DROPDOWN_ID =
  'log-console-app-analytics-range';

type CustomRangeStep = { bound: 'start' } | { bound: 'end'; startDate: string };

type LogConsoleAppAnalyticsRangeDropdownProps = {
  range: LogConsoleAppAnalyticsRange;
  onRangeChange: (range: LogConsoleAppAnalyticsRange) => void;
};

export const LogConsoleAppAnalyticsRangeDropdown = ({
  range,
  onRangeChange,
}: LogConsoleAppAnalyticsRangeDropdownProps) => {
  const { t } = useLingui();
  const { dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { closeDropdown } = useCloseDropdown();
  const [customRangeStep, setCustomRangeStep] =
    useState<CustomRangeStep | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);

  const formatDate = (plainDate: string) =>
    formatPlainDateISOString({ date: plainDate, dateFormat, localeCatalog });

  const customRangeLabel =
    range.kind === 'custom'
      ? `${formatDate(range.startDate)} – ${formatDate(range.endDate)}`
      : undefined;

  const rangeLabel =
    range.kind === 'custom'
      ? customRangeLabel
      : t(LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS[range.preset].label);

  const selectPreset = (preset: LogConsoleAppAnalyticsRangePreset) => {
    onRangeChange({ kind: 'preset', preset });
    closeDropdown(LOG_CONSOLE_APP_ANALYTICS_RANGE_DROPDOWN_ID);
  };

  const leaveCustomRange = () => {
    setCustomRangeStep(null);
    setDraftDate(null);
  };

  const openCustomRange = () => {
    setDraftDate(
      range.kind === 'custom'
        ? range.startDate
        : Temporal.Now.plainDateISO().toString(),
    );
    setCustomRangeStep({ bound: 'start' });
  };

  const confirmDraftDate = (pickedDate: string | null) => {
    const confirmedDate = pickedDate ?? draftDate;

    if (!isDefined(confirmedDate) || !isDefined(customRangeStep)) {
      return;
    }

    if (customRangeStep.bound === 'start') {
      setCustomRangeStep({ bound: 'end', startDate: confirmedDate });
      setDraftDate(
        range.kind === 'custom' && range.endDate >= confirmedDate
          ? range.endDate
          : confirmedDate,
      );

      return;
    }

    // ISO plain dates sort chronologically as strings, so picking the bounds in either order yields a valid range
    const [startDate, endDate] = [
      customRangeStep.startDate,
      confirmedDate,
    ].sort();

    onRangeChange({ kind: 'custom', startDate, endDate });
    leaveCustomRange();
    closeDropdown(LOG_CONSOLE_APP_ANALYTICS_RANGE_DROPDOWN_ID);
  };

  return (
    <Dropdown
      dropdownId={LOG_CONSOLE_APP_ANALYTICS_RANGE_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ y: 8 }}
      clickableComponent={
        <Button startIcon={<IconCalendarEvent />} endIcon={<IconChevronDown />}>
          {rangeLabel}
        </Button>
      }
      onClose={leaveCustomRange}
      dropdownComponents={
        isDefined(customRangeStep) ? (
          <LegacyDropdownContent widthInPixels={DATE_PICKER_CONTAINER_WIDTH}>
            <DropdownMenuHeader
              StartComponent={
                <DropdownMenuHeaderLeftComponent
                  onClick={leaveCustomRange}
                  Icon={IconChevronLeft}
                />
              }
            >
              {customRangeStep.bound === 'start' ? t`Start date` : t`End date`}
            </DropdownMenuHeader>
            <DatePicker
              key={customRangeStep.bound}
              instanceId={`${LOG_CONSOLE_APP_ANALYTICS_RANGE_DROPDOWN_ID}-${customRangeStep.bound}`}
              plainDateString={draftDate}
              clearable={false}
              onChange={setDraftDate}
              onClose={confirmDraftDate}
            />
          </LegacyDropdownContent>
        ) : (
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.Large}
          >
            <DropdownMenuItemsContainer>
              {typedObjectEntries(LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS).map(
                ([preset, { label }]) => {
                  const isSelected =
                    range.kind === 'preset' && range.preset === preset;

                  return (
                    <ListItemButton
                      key={preset}
                      role="option"
                      aria-selected={isSelected}
                      selected={isSelected}
                      indicator="check"
                      onClick={() => selectPreset(preset)}
                    >
                      {t(label)}
                    </ListItemButton>
                  );
                },
              )}
              <DropdownMenuSeparator />
              <ListItemButton
                role="option"
                aria-selected={range.kind === 'custom'}
                selected={range.kind === 'custom'}
                description={customRangeLabel}
                descriptionPlacement="end"
                hasSubmenu
                onClick={openCustomRange}
              >
                {t`Custom range`}
              </ListItemButton>
            </DropdownMenuItemsContainer>
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer scrollable={false}>
              <ListItemButton
                description={t`1 year`}
                descriptionPlacement="end"
                disabled
              >
                {t`Retention`}
              </ListItemButton>
            </DropdownMenuItemsContainer>
          </LegacyDropdownContent>
        )
      }
    />
  );
};
