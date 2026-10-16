import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme';

import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { type TimelineCalendarEventParticipant } from '~/generated/graphql';

jest.mock('@/applications/hooks/useApplicationChipData', () => ({
  useApplicationChipData: ({
    fallbackApplicationData,
  }: {
    fallbackApplicationData: { name: string };
  }) => ({
    applicationChipData: {
      name: fallbackApplicationData.name,
      seed: fallbackApplicationData.name,
    },
  }),
}));

const timelineBot: TimelineCalendarEventParticipant = {
  id: 'bot-participant',
  applicationId: 'application-id',
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
  applicationId: 'application-id',
  displayName: 'Call recorder',
  handle: 'Call recorder',
  isOrganizer: false,
  responseStatus: 'ACCEPTED',
};
const human: TimelineCalendarEventParticipant = {
  id: 'human-participant',
  personId: 'person-id',
  workspaceMemberId: null,
  applicationId: null,
  firstName: 'Jane',
  lastName: 'Doe',
  displayName: 'Jane Doe',
  avatarUrl: '',
  handle: 'jane@example.com',
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
    'renders an application participant from either calendar data source',
    ({ participants }) => {
      renderParticipants(participants);

      expect(screen.getByText('C')).toBeInTheDocument();
    },
  );

  it('shows people and one chip per application participant', () => {
    renderParticipants([
      human,
      timelineBot,
      { ...timelineBot, id: 'second-bot-participant' },
    ]);

    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getAllByText('C')).toHaveLength(2);
  });

  it('includes application participants in the existing overflow count', () => {
    renderParticipants([
      human,
      { ...human, id: 'second-human' },
      { ...human, id: 'third-human' },
      { ...human, id: 'fourth-human' },
      timelineBot,
    ]);

    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getAllByText('C')).toHaveLength(1);
  });
});
