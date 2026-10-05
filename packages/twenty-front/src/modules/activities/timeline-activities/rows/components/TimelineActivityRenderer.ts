import { type ComponentType } from 'react';

import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

export type StandardTimelineActivityRendererProps = {
  event: TimelineActivity;
  authorFullName: string;
};

export type TimelineActivityRenderer =
  | {
      type: 'standard';
      Component: ComponentType<StandardTimelineActivityRendererProps>;
    }
  | {
      type: 'frontComponent';
      frontComponentId: string;
    };
