import { type TimelineActivityTypeManifest } from 'twenty-shared/application';
import { type InstalledTimelineActivityType } from '~/pages/settings/applications/types/installedTimelineActivityType';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

const getSettingsApplicationTimelineActivityTypeCommonFields = (
  timelineActivityType:
    | InstalledTimelineActivityType
    | TimelineActivityTypeManifest,
): Omit<SettingsApplicationTimelineActivityType, 'id' | 'isActive'> => ({
  action: timelineActivityType.emit?.on ?? null,
  frontComponentUniversalIdentifier:
    timelineActivityType.frontComponentUniversalIdentifier,
  icon: timelineActivityType.icon,
  label: timelineActivityType.label,
  name: timelineActivityType.name,
  objectUniversalIdentifier:
    timelineActivityType.emit?.objectUniversalIdentifier,
  universalIdentifier: timelineActivityType.universalIdentifier,
});

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
        ...getSettingsApplicationTimelineActivityTypeCommonFields(
          timelineActivityType,
        ),
        id: timelineActivityType.id,
        isActive: timelineActivityType.isActive,
      }));
  }

  return manifestTimelineActivityTypes.map((timelineActivityType) => ({
    ...getSettingsApplicationTimelineActivityTypeCommonFields(
      timelineActivityType,
    ),
    id: timelineActivityType.universalIdentifier,
    isActive: true,
  }));
};
