import styled from '@emotion/styled';
import Composer from './composer/Composer';
import Booking, { BookingEvent } from './events/Booking';
import Message, { MessageEvent } from './events/Message';
import Note, { NoteEvent } from './events/Note';

export type Event = BookingEvent | MessageEvent | NoteEvent;

const StyledPanel = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const EventsContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 32px;
`;

const StyledToday = styled.div`
  font-size: 12px;
  color: #2e3138;
  border-bottom: 1px solid #eaecee;
  margin-top: 32px;
  padding-bottom: 8px;
  margin-bottom: 8px;
`;

const ComposerContainer = styled.div`
  display: flex;
  padding: 32px;
  flex-direction: column;
  flex-grow: 1;
`;

function DiscussionPanel() {
  return (
    <StyledPanel>
      <EventsContainer>
        <Booking
          booking={{
            id: 1,
            time: 'Wed, Sep 10, 2022',
            user: 'Georges',
            nights: 4,
            guests: 5,
            price: '756.90$',
            listing: 'Rochefort Montagne',
            dateRange: 'Mon, Sep 30 - Fri, Oct 2',
          }}
        />
        <StyledToday>Today</StyledToday>
        <Message
          message={{
            id: 1,
            time: '2 hours ago',
            user: 'Georges Alain',
            channel: 'sms',
            message:
              'I’m looking for my order but couldn’t find it. Could you help me find it. I don’t know where to look for.',
          }}
        />
        <Message
          message={{
            id: 2,
            time: 'just now',
            user: 'Support',
            channel: 'sms',
            message: 'Hello I’m here bla bla bla',
            agent: 'Leslie A',
          }}
        />
        <Note
          note={{
            id: 1,
            time: 'just now',
            agent: 'LeslieA',
            message: 'Hello I’m here bla bla bla',
          }}
        />
        <Message
          message={{
            id: 3,
            time: 'just now',
            user: 'Georges Alain',
            channel: 'sms',
            message: 'Thank you !',
          }}
        />
      </EventsContainer>
      <ComposerContainer>
        <Composer />
      </ComposerContainer>
    </StyledPanel>
  );
}

export default DiscussionPanel;
