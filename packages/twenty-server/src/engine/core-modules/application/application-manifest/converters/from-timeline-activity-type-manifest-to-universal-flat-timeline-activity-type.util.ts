import { type TimelineActivityTypeManifest } from 'twenty-shared/application';

import { type UniversalFlatTimelineActivityType } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-timeline-activity-type.type';

export const fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType =
  ({
    timelineActivityTypeManifest,
    applicationUniversalIdentifier,
    now,
  }: {
    timelineActivityTypeManifest: TimelineActivityTypeManifest;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatTimelineActivityType => ({
    universalIdentifier: timelineActivityTypeManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: timelineActivityTypeManifest.name,
    label: timelineActivityTypeManifest.label,
    action: timelineActivityTypeManifest.action ?? null,
    icon: timelineActivityTypeManifest.icon ?? null,
    createdAt: now,
    updatedAt: now,
  });
