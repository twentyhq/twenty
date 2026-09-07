import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const filterSettingsApplicationTimelineActivityTypes = ({
  timelineActivityTypes,
  searchTerm,
}: {
  timelineActivityTypes: SettingsApplicationTimelineActivityType[];
  searchTerm: string;
}): SettingsApplicationTimelineActivityType[] => {
  const normalizedSearchTerm = normalizeSearchText(searchTerm).trim();

  if (!isNonEmptyString(normalizedSearchTerm)) {
    return timelineActivityTypes;
  }

  return timelineActivityTypes.filter(
    (timelineActivityType) =>
      normalizeSearchText(timelineActivityType.label).includes(
        normalizedSearchTerm,
      ) ||
      normalizeSearchText(timelineActivityType.name).includes(
        normalizedSearchTerm,
      ) ||
      (isDefined(timelineActivityType.action) &&
        normalizeSearchText(timelineActivityType.action).includes(
          normalizedSearchTerm,
        )),
  );
};
