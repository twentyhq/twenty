import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import {
  getValidTimeZoneOrUndefined,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { DatePicker } from 'twenty-ui/components/input';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatSchedulingSlots } from '@/ai/components/AiChatSchedulingSlots';
import { type AiChatSchedulingAvailability } from '@/ai/types/AiChatSchedulingAvailability';
import { type AiChatSchedulingSelection } from '@/ai/types/AiChatSchedulingSelection';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { getDatePickerWeekdayLabels } from '@/localization/utils/getDatePickerWeekdayLabels';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const CALENDAR_WIDTH_PX = 268;
const STACKED_LAYOUT_WIDTH_PX = 560;
const HINT_MIN_WIDTH_PX = 240;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledBody = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  container-type: inline-size;
  overflow: hidden;
`;

const StyledLayout = styled.div`
  display: flex;
  min-width: 0;

  @container (max-width: ${STACKED_LAYOUT_WIDTH_PX}px) {
    flex-direction: column;
  }
`;

const StyledCalendar = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  flex: 0 0 ${CALENDAR_WIDTH_PX}px;
  min-width: 0;

  @container (max-width: ${STACKED_LAYOUT_WIDTH_PX}px) {
    align-self: center;
    border-right: 0;
    flex-basis: auto;
    max-width: 100%;
    width: ${CALENDAR_WIDTH_PX}px;
  }
`;

const StyledReviewFields = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledNotice = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 ${HINT_MIN_WIDTH_PX}px;
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

type AiChatTimePickerCardProps = {
  title: string;
  hint: string;
  date: string | null;
  onDateChange: (date: string) => void;
  viewedMonth: string;
  onViewedMonthChange: (month: string) => void;
  selectedSlotId: string | null;
  onSlotChange: (slotId: string | null) => void;
  availability: AiChatSchedulingAvailability;
  timeZone: string;
  locale: string;
  timeFormat: TimeFormat;
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onSendInvite: (selection: AiChatSchedulingSelection) => void;
  onSkip: () => void;
  onRetry: () => void;
  isDateUnavailable?: (date: string) => boolean;
  uncheckedAttendees?: readonly string[];
  reviewFields?: ReactElement;
  disabled?: boolean;
  isSending?: boolean;
};

export const AiChatTimePickerCard = ({
  title,
  hint,
  date,
  onDateChange,
  viewedMonth,
  onViewedMonthChange,
  selectedSlotId,
  onSlotChange,
  availability,
  timeZone,
  locale,
  timeFormat,
  weekStart,
  onSendInvite,
  onSkip,
  onRetry,
  isDateUnavailable,
  uncheckedAttendees = [],
  reviewFields,
  disabled = false,
  isSending = false,
}: AiChatTimePickerCardProps) => {
  const { t } = useLingui();
  const resolvedTimeZone =
    getValidTimeZoneOrUndefined(timeZone) ?? detectTimeZone();
  const slots =
    availability.status === 'ready' && availability.date === date
      ? availability.slots
      : [];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const areControlsDisabled = disabled || isSending;
  const canSend =
    isDefined(date) && isDefined(selectedSlot) && !areControlsDisabled;
  const uncheckedAttendeeList = formatDisplayList([...uncheckedAttendees]);

  const handleDateChange = (nextDate: string) => {
    onDateChange(nextDate);
    onSlotChange(null);
  };

  const handleSend = () => {
    if (!canSend || !isDefined(date) || !isDefined(selectedSlot)) {
      return;
    }

    onSendInvite({ date, slotId: selectedSlot.id, timeZone: resolvedTimeZone });
  };

  return (
    <Card.Root fullWidth variant="compact" role="group" aria-label={title}>
      <Card.Header>
        <StyledTitle>
          <IconCalendarEvent
            size={16}
            color={themeCssVariables.font.color.secondary}
            aria-hidden="true"
          />
          {title}
        </StyledTitle>
      </Card.Header>
      <Card.Content>
        <StyledBody>
          <StyledLayout>
            <StyledCalendar>
              <DatePicker
                aria-label={t`Choose a date`}
                value={date}
                onValueChange={handleDateChange}
                viewedMonth={viewedMonth}
                onViewedMonthChange={onViewedMonthChange}
                weekStart={weekStart}
                locale={locale}
                weekdayLabels={getDatePickerWeekdayLabels(locale)}
                previousMonthLabel={t`Previous month`}
                nextMonthLabel={t`Next month`}
                monthLabel={t`Month`}
                yearLabel={t`Year`}
                isDateUnavailable={isDateUnavailable}
                disabled={areControlsDisabled}
              />
            </StyledCalendar>
            <AiChatSchedulingSlots
              availability={availability}
              date={date}
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSlotChange={onSlotChange}
              onRetry={onRetry}
              timeZone={resolvedTimeZone}
              locale={locale}
              timeFormat={timeFormat}
              disabled={areControlsDisabled}
            />
          </StyledLayout>
          {isNonEmptyArray(uncheckedAttendees) && (
            <StyledNotice>
              <InlineBanner status="warning" layout="compact">
                {t`Availability was not checked for ${uncheckedAttendeeList}. You can still send an invite.`}
              </InlineBanner>
            </StyledNotice>
          )}
          {isDefined(reviewFields) && (
            <StyledReviewFields>{reviewFields}</StyledReviewFields>
          )}
        </StyledBody>
      </Card.Content>
      <Card.Footer divider={false}>
        <StyledFooter>
          <StyledHint>{hint}</StyledHint>
          <StyledActions>
            <Button
              size="sm"
              variant="outline"
              disabled={areControlsDisabled}
              onClick={onSkip}
            >
              {t`Skip`}
            </Button>
            <Button
              size="sm"
              color="accent"
              variant="solid"
              disabled={!canSend}
              loading={isSending}
              onClick={handleSend}
            >
              {t`Send invite`}
            </Button>
          </StyledActions>
        </StyledFooter>
      </Card.Footer>
    </Card.Root>
  );
};
