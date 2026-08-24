import { type TimelineActivityTypeManifest } from 'twenty-shared/application';
import { type InstalledTimelineActivityType } from '~/pages/settings/applications/types/installedTimelineActivityType';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

export const getSettingsApplicationTimelineActivityTypes = ({
  applicationId,
  isInstalledApplication,
  installedTimelineActivityTypes,
  manifestTimelineActivityTypes,
}: {
  applicationId: string;
  isInstalledApplication: boolean;
  installedTimelineActivityTypes: InstalledTimelineActivityType[];
  manifestTimelineActivityTypes: TimelineActivityTypeManifest[];
}): SettingsApplicationTimelineActivityType[] => {
  if (isInstalledApplication) {
    return installedTimelineActivityTypes
      .filter(
        (timelineActivityType) =>
          timelineActivityType.applicationId === applicationId,
      )
      .map((timelineActivityType) => ({
        action: timelineActivityType.emit?.on ?? null,
        icon: timelineActivityType.icon,
        id: timelineActivityType.id,
        isActive: timelineActivityType.isActive,
        label: timelineActivityType.label,
        name: timelineActivityType.name,
      }));
  }

  return manifestTimelineActivityTypes.map((timelineActivityType) => ({
    action: timelineActivityType.emit?.on ?? null,
    icon: timelineActivityType.icon,
    id: timelineActivityType.universalIdentifier,
    isActive: true,
    label: timelineActivityType.label,
    name: timelineActivityType.name,
  }));
};
