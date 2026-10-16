import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme';

import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { type TimelineCalendarEventParticipant } from '~/generated/graphql';

const timelineBot: TimelineCalendarEventParticipant = {
  id: 'bot-participant',
  personId: null,
  workspaceMemberId: null,
  firstName: '',
  lastName: '',
  displayName: 'Call recorder',
  avatarUrl: '',
  handle: 'Call recorder',
};
const recordBot: CalendarEventParticipant = {
  id: 'bot-participant',
  displayName: 'Call recorder',
  handle: 'Call recorder',
  isOrganizer: false,
  responseStatus: 'ACCEPTED',
};

const renderParticipants = (
  participants: CalendarEventParticipant[] | TimelineCalendarEventParticipant[],
) =>
  render(
    <ThemeProvider colorScheme="light">
      <CalendarEventParticipantsAvatarGroup participants={participants} />
    </ThemeProvider>,
  );

describe('CalendarEventParticipantsAvatarGroup', () => {
  it.each([{ participants: [timelineBot] }, { participants: [recordBot] }])(
    'renders a bot through the regular participant avatar from either data source',
    ({ participants }) => {
      renderParticipants(participants);
      expect(
        screen.getByRole('img', { name: 'Call recorder' }),
      ).toBeInTheDocument();
    },
  );

  it('renders separate participants when bots have the same name', () => {
    renderParticipants([timelineBot, { ...timelineBot, id: 'second-bot' }]);
    expect(screen.getAllByRole('img', { name: 'Call recorder' })).toHaveLength(
      2,
    );
  });

  it('includes bots in the regular participant overflow count', () => {
    renderParticipants(
      Array.from({ length: 5 }, (_, index) => ({
        ...timelineBot,
        id: `bot-${index}`,
      })),
    );
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
