import { isNonEmptyArray } from 'twenty-shared/utils';

type GetUpdatedTimelineActivityTypeFilterParams = {
  allTimelineActivityTypeUniversalIdentifiers: string[];
  currentFilter: string[];
  timelineActivityTypeUniversalIdentifier: string;
  isVisible: boolean;
};

export const getUpdatedTimelineActivityTypeFilter = ({
  allTimelineActivityTypeUniversalIdentifiers,
  currentFilter,
  timelineActivityTypeUniversalIdentifier,
  isVisible,
}: GetUpdatedTimelineActivityTypeFilterParams) => {
  const visibleTimelineActivityTypeUniversalIdentifiers = new Set(
    !isNonEmptyArray(currentFilter)
      ? allTimelineActivityTypeUniversalIdentifiers
      : currentFilter,
  );

  if (isVisible) {
    visibleTimelineActivityTypeUniversalIdentifiers.add(
      timelineActivityTypeUniversalIdentifier,
    );
  } else {
    visibleTimelineActivityTypeUniversalIdentifiers.delete(
      timelineActivityTypeUniversalIdentifier,
    );
  }

  const updatedFilter = allTimelineActivityTypeUniversalIdentifiers.filter(
    (universalIdentifier) =>
      visibleTimelineActivityTypeUniversalIdentifiers.has(universalIdentifier),
  );

  if (!isNonEmptyArray(updatedFilter)) {
    return currentFilter;
  }

  return updatedFilter.length ===
    allTimelineActivityTypeUniversalIdentifiers.length
    ? []
    : updatedFilter;
};
