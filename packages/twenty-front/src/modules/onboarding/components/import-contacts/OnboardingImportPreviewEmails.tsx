import {
  type ImportContactsPreviewCalendarEvent,
  IMPORT_CONTACTS_PREVIEW_CALENDAR_EVENTS,
} from '@/onboarding/constants/ImportContactsPreviewCalendarEvents';
import {
  type ImportContactsPreviewEmail,
  IMPORT_CONTACTS_PREVIEW_EMAILS,
} from '@/onboarding/constants/ImportContactsPreviewEmails';
import { styled } from '@linaria/react';
import { IconStar } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const EMAIL_ROW_HEIGHT = 32;
const EMAIL_CHECKBOX_SIZE = 12;
const EMAIL_STAR_SIZE = 11;

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 1px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const StyledEmailRow = styled.div<{ isUnread: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  color: ${({ isUnread }) =>
    isUnread
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  height: ${EMAIL_ROW_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledEmailCheckbox = styled.div`
  border: 1px solid ${themeCssVariables.font.color.light};
  border-radius: 1px;
  box-sizing: border-box;
  flex-shrink: 0;
  height: ${EMAIL_CHECKBOX_SIZE}px;
  width: ${EMAIL_CHECKBOX_SIZE}px;
`;

const StyledEmailStar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledEmailSender = styled.span<{ isUnread: boolean }>`
  font-weight: ${({ isUnread }) =>
    isUnread
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
`;

const StyledEmailSubject = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledEventCard = styled.div<{ color: 'orange' | 'sky' }>`
  background-color: ${({ color }) =>
    color === 'orange'
      ? themeCssVariables.color.orange3
      : themeCssVariables.color.sky3};
  border-left: 2px solid
    ${({ color }) =>
      color === 'orange'
        ? themeCssVariables.color.orange11
        : themeCssVariables.color.sky11};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  color: ${({ color }) =>
    color === 'orange'
      ? themeCssVariables.color.orange11
      : themeCssVariables.color.sky11};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.1;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  width: 160px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledEventTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledEventTime = styled.span`
  font-size: 10px;
`;

const EVENT_CARD_POSITIONS: Record<
  ImportContactsPreviewCalendarEvent['color'],
  { top: number; left: number; rotate: number }
> = {
  orange: { top: 160, left: 22, rotate: -7 },
  sky: { top: -4, left: 44, rotate: 10 },
};

const EmailRow = ({ email }: { email: ImportContactsPreviewEmail }) => (
  <StyledEmailRow isUnread={email.isUnread}>
    <StyledEmailCheckbox />
    <StyledEmailStar>
      <IconStar
        size={EMAIL_STAR_SIZE}
        color={themeCssVariables.font.color.light}
      />
    </StyledEmailStar>
    <StyledEmailSender isUnread={email.isUnread}>
      {email.sender}
    </StyledEmailSender>
    <StyledEmailSubject>{email.subject}</StyledEmailSubject>
  </StyledEmailRow>
);

const EventCard = ({
  event,
}: {
  event: ImportContactsPreviewCalendarEvent;
}) => {
  const position = EVENT_CARD_POSITIONS[event.color];

  return (
    <StyledEventCard
      color={event.color}
      style={{
        top: position.top,
        left: position.left,
        transform: `rotate(${position.rotate}deg)`,
      }}
    >
      <StyledEventTitle>{event.title}</StyledEventTitle>
      <StyledEventTime>{event.time}</StyledEventTime>
    </StyledEventCard>
  );
};

export const OnboardingImportPreviewEmails = () => (
  <StyledColumn>
    {IMPORT_CONTACTS_PREVIEW_EMAILS.map((email) => (
      <EmailRow key={email.id} email={email} />
    ))}
    {IMPORT_CONTACTS_PREVIEW_CALENDAR_EVENTS.map((event) => (
      <EventCard key={event.id} event={event} />
    ))}
  </StyledColumn>
);
