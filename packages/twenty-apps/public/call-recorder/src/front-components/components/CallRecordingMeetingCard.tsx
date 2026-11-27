import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  useLocale,
  useToolCall,
  useTranslate,
} from 'twenty-sdk/front-component';
import { IconCalendar } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

import { CallParticipantList } from 'src/front-components/components/CallParticipantList';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledChipSkeleton } from 'src/front-components/components/StyledChipSkeleton';
import { useCalendarEventTitle } from 'src/front-components/hooks/use-calendar-event-title';
import { formatMeetingTimeRange } from 'src/front-components/utils/format-meeting-time-range.util';
import { openRecord } from 'src/front-components/utils/open-record.util';
import { parseCallRecordingMeetingCardInput } from 'src/front-components/utils/parse-call-recording-meeting-card-input.util';

const StyledMeetingCard = styled.div`
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  width: 100%;
`;

const StyledMeetingDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[3]};
  padding: ${() => themeCssVariables.spacing[3]};
`;

const StyledMeetingHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledMeetingIcon = styled.span<{ $isMuted: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${({ $isMuted }) =>
    $isMuted
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[8]};
  justify-content: center;
  width: ${() => themeCssVariables.spacing[8]};
`;

const StyledMeetingHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledMeetingTitle = styled.span<{ $isUnavailable: boolean }>`
  color: ${({ $isUnavailable }) =>
    $isUnavailable
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-weight: ${({ $isUnavailable }) =>
    $isUnavailable
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMeetingTime = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledMeetingFooter = styled.div`
  border-top: 1px solid ${() => themeCssVariables.border.color.medium};
  display: flex;
  padding: ${() => themeCssVariables.spacing[2]}
    ${() => themeCssVariables.spacing[3]};
`;

export const CallRecordingMeetingCard = () => {
  const { t } = useTranslate();
  const locale = useLocale();
  const toolCall = useToolCall();
  const meetingCardInput = parseCallRecordingMeetingCardInput(
    toolCall?.output ?? toolCall?.input,
  );
  const calendarEventTitleState = useCalendarEventTitle(
    meetingCardInput?.calendarEventId,
  );

  if (isUndefined(meetingCardInput)) {
    return null;
  }

  const isUnavailable = calendarEventTitleState.status === 'unavailable';
  const timeRange = formatMeetingTimeRange({
    startsAt: meetingCardInput.startsAt,
    endsAt: meetingCardInput.endsAt,
    locale,
  });

  const handleOpenMeeting = () =>
    void openRecord({
      objectNameSingular: 'calendarEvent',
      recordId: meetingCardInput.calendarEventId,
    });

  return (
    <FrontComponentThemeProvider>
      <StyledMeetingCard>
        <StyledMeetingDetails>
          <StyledMeetingHeader>
            <StyledMeetingIcon $isMuted={isUnavailable}>
              <IconCalendar size={THEME_COMMON.icon.size.md} />
            </StyledMeetingIcon>
            <StyledMeetingHeading>
              {calendarEventTitleState.status === 'loading' ? (
                <StyledChipSkeleton
                  aria-busy
                  aria-label={t('Loading meeting')}
                  $width={themeCssVariables.spacing[32]}
                />
              ) : (
                <StyledMeetingTitle $isUnavailable={isUnavailable}>
                  {calendarEventTitleState.status === 'loaded'
                    ? calendarEventTitleState.title
                    : t('Meeting not available')}
                </StyledMeetingTitle>
              )}
              {!isUndefined(timeRange) && (
                <StyledMeetingTime>{timeRange}</StyledMeetingTime>
              )}
            </StyledMeetingHeading>
          </StyledMeetingHeader>
          {calendarEventTitleState.status === 'loaded' && (
            <CallParticipantList
              callRecordingId={meetingCardInput.callRecordingId}
            />
          )}
        </StyledMeetingDetails>
        {!isUnavailable && (
          <StyledMeetingFooter>
            <Button size="sm" variant="outline" onClick={handleOpenMeeting}>
              {t('Open meeting')}
            </Button>
          </StyledMeetingFooter>
        )}
      </StyledMeetingCard>
    </FrontComponentThemeProvider>
  );
};
