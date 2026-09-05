import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isToday } from 'date-fns';
import { type ReactNode, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconClockHour8,
} from 'twenty-ui/icon';
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
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
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

export const InboxSnoozeDropdown = ({
  inboxItem,
  clickableComponent,
}: InboxSnoozeDropdownProps) => {
  const { t, i18n } = useLingui();
  const { transitionInboxItem } = useInboxItemActions();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeDropdown } = useCloseDropdown();
  // A day or a time picked is held until the moment is confirmed, so either can
  // still be changed.
  const [pickedDateTime, setPickedDateTime] =
    useState<Temporal.ZonedDateTime | null>(null);

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

  const startPickingDateTime = () =>
    setPickedDateTime(
      Temporal.Instant.fromEpochMilliseconds(
        (
          options.find((option) => option.key === 'tomorrow') ?? options[0]
        )?.date.getTime() ?? Date.now(),
      ).toZonedDateTimeISO(Temporal.Now.timeZoneId()),
    );

  const snoozeUntilPicked = (date: Temporal.ZonedDateTime | null) => {
    if (date !== null) {
      void snoozeUntil(new Date(date.epochMilliseconds));
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-end"
      clickableComponent={clickableComponent}
      onClose={() => setPickedDateTime(null)}
      dropdownComponents={
        <DropdownContent widthInPixels={SNOOZE_MENU_WIDTH}>
          {pickedDateTime !== null ? (
            <>
              <DropdownMenuHeader
                StartComponent={
                  <DropdownMenuHeaderLeftComponent
                    Icon={IconChevronLeft}
                    onClick={() => setPickedDateTime(null)}
                  />
                }
              >
                {t`Day & Time`}
              </DropdownMenuHeader>
              <DateTimePicker
                instanceId={dropdownId}
                date={pickedDateTime}
                clearable={false}
                onChange={setPickedDateTime}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <MenuItem
                  LeftIcon={IconClockHour8}
                  text={t`Snooze until ${formatMoment(
                    new Date(pickedDateTime.epochMilliseconds),
                  )}`}
                  onClick={() => snoozeUntilPicked(pickedDateTime)}
                />
              </DropdownMenuItemsContainer>
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
                  onClick={startPickingDateTime}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
