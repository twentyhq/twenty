import { GettingStartedBookCallMonthCalendar } from '@/getting-started/components/GettingStartedBookCallMonthCalendar';
import { GettingStartedBookCallSlotsLoadEffect } from '@/getting-started/effect-components/GettingStartedBookCallSlotsLoadEffect';
import { type CalSlot } from '@/getting-started/types/CalSlot';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconArrowRight, IconClock, IconWorld } from 'twenty-ui/icon';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { MOBILE_VIEWPORT, themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledPreview = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledInfo = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
    border-right: none;
  }
`;

const StyledHost = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTwentyLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 20px;
  width: 20px;
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledListItem = styled.li`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNextAvailable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: auto;
`;

const StyledCalendarColumn = styled.div`
  background: ${themeCssVariables.background.primary};
  padding: ${themeCssVariables.spacing[4]};
`;

type GettingStartedBookCallPreviewProps = {
  calendarBookingPageId: string;
  onOpenBookingPage: (dayKey?: string) => void;
};

export const GettingStartedBookCallPreview = ({
  calendarBookingPageId,
  onOpenBookingPage,
}: GettingStartedBookCallPreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { timeZone, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const [slotsByDay, setSlotsByDay] = useState<Record<
    string,
    CalSlot[]
  > | null>(null);

  const today = Temporal.Now.plainDateISO(timeZone);
  const availableDayKeys = Object.entries(slotsByDay ?? {})
    .filter(([, slots]) => isNonEmptyArray(slots))
    .map(([dayKey]) => dayKey)
    .sort();
  const firstAvailableDayKey = availableDayKeys.at(0);
  const nextSlot = isDefined(firstAvailableDayKey)
    ? slotsByDay?.[firstAvailableDayKey]?.at(0)
    : undefined;
  const callDurationMinutes = isDefined(nextSlot)
    ? differenceInMinutes(new Date(nextSlot.end), new Date(nextSlot.start))
    : null;
  const displayedMonth = (
    isDefined(firstAvailableDayKey)
      ? Temporal.PlainDate.from(firstAvailableDayKey)
      : today
  ).with({ day: 1 });

  const formatSlotStart = (dateFormat: string) =>
    isDefined(nextSlot)
      ? formatInTimeZone(new Date(nextSlot.start), timeZone, dateFormat, {
          locale: localeCatalog,
        })
      : '';

  return (
    <StyledPreview>
      <GettingStartedBookCallSlotsLoadEffect
        calendarBookingPageId={calendarBookingPageId}
        timeZone={timeZone}
        onSlotsLoaded={setSlotsByDay}
      />
      <StyledInfo>
        <StyledHost>
          <StyledTwentyLogo src="/images/integrations/twenty-logo.svg" alt="" />
          <Text size="sm" weight="medium" color="secondary">
            {t`Twenty team`}
          </Text>
        </StyledHost>
        <StyledList>
          {isDefined(callDurationMinutes) && (
            <StyledListItem>
              <IconClock size={theme.icon.size.md} />
              {t`${callDurationMinutes} min`}
            </StyledListItem>
          )}
          <StyledListItem>
            <IconWorld size={theme.icon.size.md} />
            {timeZone.replaceAll('_', ' ')}
          </StyledListItem>
        </StyledList>
        <StyledNextAvailable>
          <Text size="xs" color="tertiary">
            {t`Next available`}
          </Text>
          {slotsByDay === null ? (
            <Skeleton height={16} width={140} />
          ) : (
            <Text size="sm" weight="medium" color="primary">
              {isDefined(nextSlot)
                ? `${formatSlotStart(doNotTranslate('EEE, MMM d'))} · ${formatSlotStart(timeFormat)}`
                : t`Pick a time that suits you`}
            </Text>
          )}
        </StyledNextAvailable>
        <Button
          variant="solid"
          color="accent"
          fullWidth
          endIcon={<IconArrowRight />}
          onClick={() => onOpenBookingPage()}
        >
          {t`Pick a time`}
        </Button>
      </StyledInfo>
      <StyledCalendarColumn>
        <GettingStartedBookCallMonthCalendar
          displayedMonth={displayedMonth}
          todayKey={today.toString()}
          availableDayKeys={availableDayKeys}
          onSelectDay={onOpenBookingPage}
        />
      </StyledCalendarColumn>
    </StyledPreview>
  );
};
