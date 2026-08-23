import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { getUpdatedTimelineActivityTypeFilter } from '@/activities/timeline-activities/utils/getUpdatedTimelineActivityTypeFilter';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconFilterOff, useIcons } from 'twenty-ui/icon';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const SHOW_ALL_ACTIVITY_ITEM_ID = 'show-all-timeline-activity-types';

export const SidePanelTimelineFilterPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { instanceId: targetRecordId } = useAtomStateValue(
    sidePanelPageInfoState,
  );
  const { activeTimelineActivityTypes } = useTimelineActivityTypes();

  const timelineActivityTypeUniversalIdentifiersFilter =
    useAtomFamilyStateValue(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetRecordId,
    );
  const setTimelineActivityTypeUniversalIdentifiersFilter =
    useSetAtomFamilyState(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetRecordId,
    );

  const normalizedSearch = normalizeSearchText(sidePanelSearch);
  const filteredTimelineActivityTypes = activeTimelineActivityTypes.filter(
    ({ label }) => normalizeSearchText(label).includes(normalizedSearch),
  );
  const allTimelineActivityTypeUniversalIdentifiers =
    activeTimelineActivityTypes.map(
      ({ universalIdentifier }) => universalIdentifier,
    );
  const isFiltering = isNonEmptyArray(
    timelineActivityTypeUniversalIdentifiersFilter,
  );
  const isSearchEmpty = !isNonEmptyString(sidePanelSearch);
  const visibleTimelineActivityTypeUniversalIdentifiers = new Set(
    isFiltering
      ? timelineActivityTypeUniversalIdentifiersFilter
      : allTimelineActivityTypeUniversalIdentifiers,
  );
  const visibleTimelineActivityTypeCount =
    allTimelineActivityTypeUniversalIdentifiers.filter((universalIdentifier) =>
      visibleTimelineActivityTypeUniversalIdentifiers.has(universalIdentifier),
    ).length;

  const selectableItemIds = [
    ...filteredTimelineActivityTypes.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    ...(isFiltering && isSearchEmpty ? [SHOW_ALL_ACTIVITY_ITEM_ID] : []),
  ];

  const setTimelineActivityTypeVisibility = (
    timelineActivityTypeUniversalIdentifier: string,
    isVisible: boolean,
  ) => {
    setTimelineActivityTypeUniversalIdentifiersFilter(
      getUpdatedTimelineActivityTypeFilter({
        allTimelineActivityTypeUniversalIdentifiers,
        currentFilter: timelineActivityTypeUniversalIdentifiersFilter,
        timelineActivityTypeUniversalIdentifier,
        isVisible,
      }),
    );
  };

  return (
    <SidePanelList
      selectableItemIds={selectableItemIds}
      noResults={!isNonEmptyArray(filteredTimelineActivityTypes)}
    >
      <SidePanelGroup heading={t`Activity types`}>
        {filteredTimelineActivityTypes.map((timelineActivityType) => {
          const isVisible = visibleTimelineActivityTypeUniversalIdentifiers.has(
            timelineActivityType.universalIdentifier,
          );
          const isLastVisibleTimelineActivityType =
            isVisible && visibleTimelineActivityTypeCount === 1;

          return (
            <SelectableListItem
              key={timelineActivityType.universalIdentifier}
              itemId={timelineActivityType.universalIdentifier}
              onEnter={() => {
                if (!isLastVisibleTimelineActivityType) {
                  setTimelineActivityTypeVisibility(
                    timelineActivityType.universalIdentifier,
                    !isVisible,
                  );
                }
              }}
            >
              <CommandMenuItemToggle
                id={timelineActivityType.universalIdentifier}
                LeftIcon={
                  isDefined(timelineActivityType.icon)
                    ? getIcon(timelineActivityType.icon)
                    : undefined
                }
                text={timelineActivityType.label}
                toggled={isVisible}
                disabled={isLastVisibleTimelineActivityType}
                onToggleChange={(nextIsVisible) =>
                  setTimelineActivityTypeVisibility(
                    timelineActivityType.universalIdentifier,
                    nextIsVisible,
                  )
                }
              />
            </SelectableListItem>
          );
        })}
      </SidePanelGroup>
      {isFiltering && isSearchEmpty && (
        <SidePanelGroup heading={t`Actions`}>
          <SelectableListItem
            itemId={SHOW_ALL_ACTIVITY_ITEM_ID}
            onEnter={() =>
              setTimelineActivityTypeUniversalIdentifiersFilter([])
            }
          >
            <CommandMenuItem
              id={SHOW_ALL_ACTIVITY_ITEM_ID}
              Icon={IconFilterOff}
              label={t`Show all activity`}
              onClick={() =>
                setTimelineActivityTypeUniversalIdentifiersFilter([])
              }
            />
          </SelectableListItem>
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
