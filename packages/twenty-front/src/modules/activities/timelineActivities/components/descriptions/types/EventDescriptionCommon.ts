import styled from '@emotion/styled';

import { EventActivityDescription } from '@/activities/timelineActivities/components/descriptions/components/EventActivityDescription';
import { EventCalendarEventDescription } from '@/activities/timelineActivities/components/descriptions/components/EventCalendarEventDescription';
import { EventMessageDescription } from '@/activities/timelineActivities/components/descriptions/components/EventMessageDescription';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export interface EventDescriptionCommonProps {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
  authorFullName: string;
}

export const eventDescriptionComponentMap: {
  [key: string]: React.FC<EventDescriptionCommonProps>;
} = {
  calendarEvent: EventCalendarEventDescription,
  message: EventMessageDescription,
  task: EventActivityDescription,
  note: EventActivityDescription,
};

export const StyledButtonContainer = styled.div`
  border-radius: 4px;
`;

export const StyledItemAuthorText = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

export const StyledItemLabelIdentifier = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

export const StyledItemAction = styled.span`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  white-space: nowrap;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.secondary};
`;
