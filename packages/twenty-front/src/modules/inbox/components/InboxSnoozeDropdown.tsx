import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isToday } from 'date-fns';
import { type ReactNode, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { IconCalendarEvent, IconChevronLeft } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { getInboxSnoozeOptions } from '@/inbox/utils/getInboxSnoozeOptions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type InboxItem } from '~/generated/graphql';
import { formatDate } from '~/utils/date-utils';

const StyledMoment = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  white-space: nowrap;
`;

const SNOOZE_MENU_WIDTH = 320;

type InboxSnoozeDropdownProps = {
  inboxItem: InboxItem;
  clickableComponent: ReactNode;
};

// One menu for "come back to this later", wherever an item can be snoozed
// from: a few moments people usually mean, and a picker for any other.
export const InboxSnoozeDropdown = ({
  inboxItem,
  clickableComponent,
}: InboxSnoozeDropdownProps) => {
  const { t, i18n } = useLingui();
  const { transitionInboxItem } = useInboxItemActions();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeDropdown } = useCloseDropdown();
  const [isPickingDateTime, setIsPickingDateTime] = useState(false);

  const dropdownId = `inbox-snooze-${inboxItem.id}`;
  const options = getInboxSnoozeOptions(new Date());

  const formatMoment = (date: Date) =>
    isToday(date)
      ? t`Today, ${formatDate(date, 'h:mm a')}`
      : formatDate(date, 'EEE, MMM d, yyyy, h:mm a');

  const snoozeUntil = async (date: Date) => {
    try {
      await transitionInboxItem({
        inboxItemId: inboxItem.id,
        transition: { kind: 'CLEAR', resurfaceAt: date.toISOString() },
        expectedVersion: inboxItem.version,
      });
    } catch {
      enqueueErrorSnackBar({ message: t`That could not be applied` });
    }

    closeDropdown(dropdownId);
  };

  const pickerDefault = Temporal.Instant.fromEpochMilliseconds(
    (
      options.find((option) => option.key === 'tomorrow') ?? options[0]
    )?.date.getTime() ?? Date.now(),
  ).toZonedDateTimeISO(Temporal.Now.timeZoneId());

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-end"
      clickableComponent={clickableComponent}
      onClose={() => setIsPickingDateTime(false)}
      dropdownComponents={
        <DropdownContent widthInPixels={SNOOZE_MENU_WIDTH}>
          {isPickingDateTime ? (
            <>
              <DropdownMenuHeader
                StartComponent={
                  <DropdownMenuHeaderLeftComponent
                    Icon={IconChevronLeft}
                    onClick={() => setIsPickingDateTime(false)}
                  />
                }
              >
                {t`Day & Time`}
              </DropdownMenuHeader>
              <DateTimePicker
                instanceId={dropdownId}
                date={pickerDefault}
                onEnter={(date) => {
                  if (date !== null) {
                    void snoozeUntil(new Date(date.epochMilliseconds));
                  }
                }}
                onClose={(date) => {
                  if (date !== null) {
                    void snoozeUntil(new Date(date.epochMilliseconds));
                  }
                }}
                onEscape={() => setIsPickingDateTime(false)}
              />
            </>
          ) : (
            <>
              <DropdownMenuHeader>{t`Snooze`}</DropdownMenuHeader>
              <DropdownMenuItemsContainer>
                {options.map((option) => (
                  <MenuItem
                    key={option.key}
                    text={i18n._(option.label)}
                    contextualText={
                      <StyledMoment>{formatMoment(option.date)}</StyledMoment>
                    }
                    contextualTextPosition="right"
                    onClick={() => void snoozeUntil(option.date)}
                  />
                ))}
                <MenuItem
                  LeftIcon={IconCalendarEvent}
                  text={t`Day & Time`}
                  hasSubMenu
                  onClick={() => setIsPickingDateTime(true)}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
