import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useTimelineActivityTypeFilter } from '@/activities/timeline-activities/hooks/useTimelineActivityTypeFilter';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
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
    <DropdownRoot
      dropdownId={`timeline-filter-${targetRecord.id}`}
      type="picker"
      multiple
      onOpenChange={(open) => {
        if (!open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger
        render={
          <WidgetCardHeaderActionButton
            Icon={IconFilter}
            label={t`Filter timeline`}
          />
        }
      />
      <DropdownContent
        align="end"
        width={GenericDropdownContentWidth.ExtraLarge}
      >
        <Dropdown.Search
          value={searchInputValue}
          onValueChange={setSearchInputValue}
          placeholder={t`Search`}
          aria-label={t`Search activity types`}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {filteredTimelineActivityTypes.map((timelineActivityType) => (
            <Dropdown.OptionItem
              key={timelineActivityType.universalIdentifier}
              selected={effectiveTimelineActivityTypeUniversalIdentifiersFilter.includes(
                timelineActivityType.universalIdentifier,
              )}
              onSelect={() =>
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
            </Dropdown.OptionItem>
          ))}
          {!isNonEmptyArray(filteredTimelineActivityTypes) && (
            <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
        {isNonEmptyArray(timelineActivityTypeUniversalIdentifiersFilter) && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconFilterOff />}
                closeOnClick={false}
                onClick={() =>
                  setTimelineActivityTypeUniversalIdentifiersFilter([])
                }
              >{t`Clear filter`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
