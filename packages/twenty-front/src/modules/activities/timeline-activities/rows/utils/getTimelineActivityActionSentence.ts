import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export const getTimelineActivityActionSentence = ({
  eventAction,
  objectNameSingular,
  timelineActivityTypeLabel,
}: {
  eventAction: TimelineActivityAction | null;
  // Lingui includes the placeholder name in its message ID, so this reuses the
  // existing translations emitted by the specialized activity renderer.
  objectNameSingular: string;
  timelineActivityTypeLabel: string | null;
}): string => {
  switch (eventAction) {
    case 'created':
      return t`created a related ${objectNameSingular}`;
    case 'updated':
      return t`updated a related ${objectNameSingular}`;
    case 'deleted':
      return t`deleted a related ${objectNameSingular}`;
    case 'restored':
      return t`restored a related ${objectNameSingular}`;
    case 'linked':
      return t`linked a related ${objectNameSingular}`;
    case 'unlinked':
      return t`unlinked a related ${objectNameSingular}`;
    default:
      return isNonEmptyString(timelineActivityTypeLabel)
        ? timelineActivityTypeLabel
        : t`interacted with a related ${objectNameSingular}`;
  }
};
