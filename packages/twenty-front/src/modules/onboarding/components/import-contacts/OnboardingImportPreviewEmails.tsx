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

const EVENT_CARD_WIDTH = 160;

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
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[3]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledEmailCheckbox = styled.div`
  border: 1px solid ${themeCssVariables.font.color.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  box-sizing: border-box;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[3]};
  width: ${themeCssVariables.spacing[3]};

  &[data-selected='true'] {
    border-color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmailStar = styled.span`
  background-color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[3]};
  mask: url('/images/onboarding/import-preview/star.svg') center / contain
    no-repeat;
  width: ${themeCssVariables.spacing[3]};

  &[data-selected='true'] {
    background-color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmailSender = styled.span`
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${themeCssVariables.spacing[30]};

  &[data-medium='true'] {
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

const StyledEmailSubject = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledEventCard = styled.div`
  animation: onboardingImportPreviewEventCardIn 900ms
    cubic-bezier(0.22, 1, 0.36, 1) both;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.1;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  transform: var(--event-card-transform);
  width: ${EVENT_CARD_WIDTH}px;

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
    border-left: 2px solid ${themeCssVariables.color.orange11};
    color: ${themeCssVariables.color.orange11};
  }

  &[data-color='sky'] {
    animation-delay: 150ms;
    background-color: ${themeCssVariables.color.sky3};
    border-left: 2px solid ${themeCssVariables.color.sky11};
    color: ${themeCssVariables.color.sky11};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledEventTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledEventTime = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
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
    top: 159,
    left: 21,
    rotate: -7,
    entry: { x: 8, y: -10, rotate: -2, scale: 0.94 },
  },
  sky: {
    top: -5,
    left: 43,
    rotate: 10,
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
