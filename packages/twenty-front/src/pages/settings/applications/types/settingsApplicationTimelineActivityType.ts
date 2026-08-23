import { type TimelineActivityTypeManifest } from 'twenty-shared/application';
import { type FindManyTimelineActivityTypesQuery } from '~/generated-metadata/graphql';

export type InstalledTimelineActivityType =
  FindManyTimelineActivityTypesQuery['timelineActivityTypes'][number];

export type SettingsApplicationTimelineActivityType = {
  action: string | null;
  icon?: string | null;
  id: string;
  isActive: boolean;
  isInstalled: boolean;
  label: string;
  name: string;
};

export const getSettingsApplicationTimelineActivityTypes = ({
  applicationId,
  installedApplication,
  installedTimelineActivityTypes,
  manifestTimelineActivityTypes,
}: {
  applicationId: string;
  installedApplication: boolean;
  installedTimelineActivityTypes: InstalledTimelineActivityType[];
  manifestTimelineActivityTypes: TimelineActivityTypeManifest[];
}): SettingsApplicationTimelineActivityType[] =>
  installedApplication
    ? installedTimelineActivityTypes
        .filter(
          (timelineActivityType) =>
            timelineActivityType.applicationId === applicationId,
        )
        .map((timelineActivityType) => ({
          action: timelineActivityType.emit?.on ?? null,
          icon: timelineActivityType.icon,
          id: timelineActivityType.id,
          isActive: timelineActivityType.isActive,
          isInstalled: true,
          label: timelineActivityType.label,
          name: timelineActivityType.name,
        }))
    : manifestTimelineActivityTypes.map((timelineActivityType) => ({
        action: timelineActivityType.emit?.on ?? null,
        icon: timelineActivityType.icon,
        id: timelineActivityType.universalIdentifier,
        isActive: true,
        isInstalled: false,
        label: timelineActivityType.label,
        name: timelineActivityType.name,
      }));
