import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useTimelineActivityTypeFilter } from '@/activities/timeline-activities/hooks/useTimelineActivityTypeFilter';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconFilter, IconFilterOff, useIcons } from 'twenty-ui/icon';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const WidgetActionTimelineFilter = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { getIcon } = useIcons();
  const [searchInputValue, setSearchInputValue] = useState('');

  const {
    activeTimelineActivityTypes,
    effectiveTimelineActivityTypeUniversalIdentifiersFilter:
      nullableEffectiveTimelineActivityTypeUniversalIdentifiersFilter,
    selectedTimelineActivityTypeUniversalIdentifiers:
      timelineActivityTypeUniversalIdentifiersFilter,
  } = useTimelineActivityTypeFilter(targetRecord.id);
  const setTimelineActivityTypeUniversalIdentifiersFilter =
    useSetAtomFamilyState(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetRecord.id,
    );

  const normalizedSearchInputValue = normalizeSearchText(searchInputValue);
  const filteredTimelineActivityTypes = activeTimelineActivityTypes.filter(
    ({ label }) =>
      normalizeSearchText(label).includes(normalizedSearchInputValue),
  );

  const effectiveTimelineActivityTypeUniversalIdentifiersFilter =
    nullableEffectiveTimelineActivityTypeUniversalIdentifiersFilter ?? [];

  if (!isNonEmptyArray(activeTimelineActivityTypes)) {
    return null;
  }

  const handleSelectChange = (
    timelineActivityTypeUniversalIdentifier: string,
    selected: boolean,
  ) =>
    setTimelineActivityTypeUniversalIdentifiersFilter(
      selected
        ? [
            ...timelineActivityTypeUniversalIdentifiersFilter,
            timelineActivityTypeUniversalIdentifier,
          ]
        : timelineActivityTypeUniversalIdentifiersFilter.filter(
            (selectedUniversalIdentifier) =>
              selectedUniversalIdentifier !==
              timelineActivityTypeUniversalIdentifier,
          ),
    );

  return (
    <Dropdown
      dropdownId={`timeline-filter-${targetRecord.id}`}
      clickableComponent={
        <WidgetCardHeaderActionButton
          Icon={IconFilter}
          label={t`Filter timeline`}
        />
      }
      dropdownPlacement="bottom-end"
      onClose={() => setSearchInputValue('')}
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
          <DropdownMenuSearchInput
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer isMultiSelect hasMaxHeight>
            {isNonEmptyArray(filteredTimelineActivityTypes) ? (
              filteredTimelineActivityTypes.map((timelineActivityType) => (
                <ListItem
                  render={<button type="button" />}
                  key={timelineActivityType.universalIdentifier}
                  role="option"
                  aria-selected={effectiveTimelineActivityTypeUniversalIdentifiersFilter.includes(
                    timelineActivityType.universalIdentifier,
                  )}
                  selected={effectiveTimelineActivityTypeUniversalIdentifiersFilter.includes(
                    timelineActivityType.universalIdentifier,
                  )}
                  indicator="checkbox"
                  onClick={() =>
                    handleSelectChange(
                      timelineActivityType.universalIdentifier,
                      !effectiveTimelineActivityTypeUniversalIdentifiersFilter.includes(
                        timelineActivityType.universalIdentifier,
                      ),
                    )
                  }
                  startIcon={
                    <SelectOptionIcon
                      Icon={
                        isDefined(timelineActivityType.icon)
                          ? getIcon(timelineActivityType.icon)
                          : undefined
                      }
                    />
                  }
                >
                  {timelineActivityType.label}
                </ListItem>
              ))
            ) : (
              <ListItem disabled>{t`No results`}</ListItem>
            )}
          </DropdownMenuItemsContainer>
          {isNonEmptyArray(timelineActivityTypeUniversalIdentifiersFilter) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <ListItem
                  startIcon={<IconFilterOff />}
                  onClick={() =>
                    setTimelineActivityTypeUniversalIdentifiersFilter([])
                  }
                >{t`Clear filter`}</ListItem>
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
