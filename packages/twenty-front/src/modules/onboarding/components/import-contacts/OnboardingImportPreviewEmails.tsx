import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';

import {
  type ImportContactsPreviewCalendarEvent,
  IMPORT_CONTACTS_PREVIEW_CALENDAR_EVENTS,
} from '@/onboarding/constants/ImportContactsPreviewCalendarEvents';
import {
  type ImportContactsPreviewEmail,
  IMPORT_CONTACTS_PREVIEW_EMAILS,
} from '@/onboarding/constants/ImportContactsPreviewEmails';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const EMAIL_ROW_HEIGHT = 32;
const EMAIL_FONT_SIZE = 11.886;

const SENDER_COLORS: Record<ImportContactsPreviewEmail['senderColor'], string> =
  {
    primary: themeCssVariables.font.color.primary,
    secondary: themeCssVariables.font.color.secondary,
    tertiary: themeCssVariables.font.color.tertiary,
  };

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

const StyledEmailRow = styled.div`
  background-color: ${themeCssVariables.background.primary};
  flex-shrink: 0;
  font-family: Roboto, ${themeCssVariables.font.family};
  font-size: ${EMAIL_FONT_SIZE}px;
  height: ${EMAIL_ROW_HEIGHT}px;
  letter-spacing: -0.0341px;
  line-height: normal;
  position: relative;
  white-space: nowrap;
`;

const StyledEmailCheckbox = styled.div`
  border: 1.371px solid ${themeCssVariables.font.color.light};
  border-radius: 0.914px;
  box-sizing: border-box;
  height: 11.886px;
  left: 12.71px;
  position: absolute;
  top: 9.91px;
  width: 11.886px;

  &[data-selected='true'] {
    border-color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmailStar = styled.span`
  background-color: ${themeCssVariables.font.color.light};
  height: 11.87px;
  left: 36.63px;
  mask: url('/images/onboarding/import-preview/star.svg') center / contain
    no-repeat;
  position: absolute;
  top: 9.75px;
  width: 12.5px;

  &[data-selected='true'] {
    background-color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmailSender = styled.span`
  font-weight: ${themeCssVariables.font.weight.regular};
  left: 61.17px;
  position: absolute;
  top: 9px;

  &[data-medium='true'] {
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

const StyledEmailSubject = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  left: 193.74px;
  position: absolute;
  top: 9px;
`;

const StyledEventCard = styled.div`
  animation: onboardingImportPreviewEventCardIn 900ms
    cubic-bezier(0.22, 1, 0.36, 1) both;
  box-shadow:
    0 1.206px 2.411px 0 ${themeCssVariables.background.transparent.light},
    1.206px 2.411px 9.646px 0 ${themeCssVariables.color.transparent.gray6};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4.823px;
  line-height: 1.1;
  overflow: hidden;
  padding: 9.646px;
  position: absolute;
  transform: var(--event-card-transform);
  width: 160.014px;

  @keyframes onboardingImportPreviewEventCardIn {
    from {
      opacity: 0;
      transform: var(--event-card-entry-transform);
    }
    to {
      opacity: 1;
      transform: var(--event-card-transform);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &[data-color='orange'] {
    animation-delay: 300ms;
    background-color: ${themeCssVariables.color.orange3};
    border-left: 2.411px solid ${themeCssVariables.color.orange11};
    border-radius: ${themeCssVariables.border.radius.md};
    color: ${themeCssVariables.color.orange11};
  }

  &[data-color='sky'] {
    animation-delay: 150ms;
    background-color: ${themeCssVariables.color.sky3};
    border-left: 2.411px solid ${themeCssVariables.color.sky11};
    border-radius: 1.638px;
    color: ${themeCssVariables.color.sky11};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledEventTitle = styled.span`
  font-size: 12.06px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledEventTime = styled.span`
  font-size: 9.65px;
`;

const EVENT_CARD_POSITIONS: Record<
  ImportContactsPreviewCalendarEvent['color'],
  {
    top: number;
    left: number;
    rotate: number;
    entry: { x: number; y: number; rotate: number; scale: number };
  }
> = {
  orange: {
    top: 158.93,
    left: 21.35,
    rotate: -7.06,
    entry: { x: 8, y: -10, rotate: -2, scale: 0.94 },
  },
  sky: {
    top: -5.44,
    left: 43.09,
    rotate: 9.98,
    entry: { x: 8, y: 10, rotate: 5, scale: 0.94 },
  },
};

const EmailRow = ({ email }: { email: ImportContactsPreviewEmail }) => (
  <StyledEmailRow>
    <StyledEmailCheckbox data-selected={email.isSelected} />
    <StyledEmailStar data-selected={email.isSelected} />
    <StyledEmailSender
      data-medium={email.isSenderMedium}
      style={{ color: SENDER_COLORS[email.senderColor] }}
    >
      {email.sender}
    </StyledEmailSender>
    {isDefined(email.subject) && (
      <StyledEmailSubject>{email.subject}</StyledEmailSubject>
    )}
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
      data-color={event.color}
      style={
        {
          top: position.top,
          left: position.left,
          '--event-card-transform': `rotate(${position.rotate}deg)`,
          '--event-card-entry-transform': `translate(${position.entry.x}px, ${position.entry.y}px) rotate(${position.entry.rotate}deg) scale(${position.entry.scale})`,
        } as React.CSSProperties
      }
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
