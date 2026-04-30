import { styled } from '@linaria/atomic';

import {
  IncidentTimelineEvent,
  TimelineEventType,
} from '../types/incidents.types';

type IncidentTimelineProps = {
  events: IncidentTimelineEvent[];
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  created: '#3b82f6',
  status_change: '#8b5cf6',
  assignment: '#f59e0b',
  note: '#6b7280',
  escalation: '#ef4444',
  resolution: '#22c55e',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 24px;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
`;

const EventItem = styled.div`
  position: relative;
  padding: 8px 0 16px 16px;
`;

const EventDot = styled.div<{ color: string }>`
  position: absolute;
  left: -20px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  border: 2px solid white;
  box-shadow: 0 0 0 2px ${(props) => props.color};
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EventDescription = styled.span`
  font-size: 13px;
`;

const EventMeta = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const EventType = styled.span<{ color: string }>`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.color};
  background: ${(props) => `${props.color}15`};
  margin-right: 6px;
`;

export const IncidentTimeline = ({ events }: IncidentTimelineProps) => {
  return (
    <Container>
      <TimelineLine />
      {events.map((event) => (
        <EventItem key={event.id}>
          <EventDot color={EVENT_COLORS[event.type]} />
          <EventContent>
            <EventDescription>
              <EventType color={EVENT_COLORS[event.type]}>
                {event.type.replace('_', ' ')}
              </EventType>
              {event.description}
            </EventDescription>
            <EventMeta>
              {event.authorName} -{' '}
              {new Date(event.createdAt).toLocaleString()}
            </EventMeta>
          </EventContent>
        </EventItem>
      ))}
    </Container>
  );
};
