import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { getActiveTimelineActivityTypeUniversalIdentifiersFilter } from '@/activities/timeline-activities/utils/getActiveTimelineActivityTypeUniversalIdentifiersFilter';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useTimelineActivityTypeFilter = (recordId: string) => {
  const { activeTimelineActivityTypes, timelineActivityTypeMaps } =
    useTimelineActivityTypes();
  const timelineActivityTypeUniversalIdentifiersFilter =
    useAtomFamilyStateValue(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      recordId,
    );

  return {
    activeTimelineActivityTypes,
    effectiveTimelineActivityTypeUniversalIdentifiersFilter:
      getActiveTimelineActivityTypeUniversalIdentifiersFilter({
        activeUniversalIdentifiers: activeTimelineActivityTypes.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
        selectedUniversalIdentifiers:
          timelineActivityTypeUniversalIdentifiersFilter,
      }),
    selectedTimelineActivityTypeUniversalIdentifiers:
      timelineActivityTypeUniversalIdentifiersFilter,
    timelineActivityTypeMaps,
  };
};
