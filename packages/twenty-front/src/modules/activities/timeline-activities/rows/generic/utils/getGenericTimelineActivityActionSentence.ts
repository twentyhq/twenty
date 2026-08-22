import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export const getGenericTimelineActivityActionSentence = ({
  eventAction,
  objectLabel,
  timelineActivityTypeLabel,
}: {
  eventAction: TimelineActivityAction | null;
  objectLabel: string;
  timelineActivityTypeLabel: string | null;
}): string => {
  switch (eventAction) {
    case 'created':
      return t`created a related ${objectLabel}`;
    case 'updated':
      return t`updated a related ${objectLabel}`;
    case 'deleted':
      return t`deleted a related ${objectLabel}`;
    case 'restored':
      return t`restored a related ${objectLabel}`;
    case 'linked':
      return t`linked a related ${objectLabel}`;
    case 'unlinked':
      return t`unlinked a related ${objectLabel}`;
    default:
      return isNonEmptyString(timelineActivityTypeLabel)
        ? timelineActivityTypeLabel
        : t`interacted with a related ${objectLabel}`;
  }
};
