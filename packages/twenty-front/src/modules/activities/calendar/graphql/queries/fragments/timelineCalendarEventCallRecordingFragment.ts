import { gql } from '@apollo/client';

export const timelineCalendarEventCallRecordingFragment = gql`
  fragment TimelineCalendarEventCallRecordingFragment on TimelineCalendarEventCallRecording {
    id
    status
  }
`;
