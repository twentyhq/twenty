import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconFilter, IconFilterOff, useIcons } from 'twenty-ui/icon';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

export const WidgetActionTimelineFilter = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { getIcon } = useIcons();
  const { timelineActivityTypeMaps } = useTimelineActivityTypes();

  const timelineActivityTypeUniversalIdentifiersFilter =
    useAtomFamilyStateValue(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetRecord.id,
    );
  const setTimelineActivityTypeUniversalIdentifiersFilter =
    useSetAtomFamilyState(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetRecord.id,
    );

  const timelineActivityTypes = [
    ...timelineActivityTypeMaps.byId.values(),
  ].filter(({ isActive }) => isActive !== false);

  if (!isNonEmptyArray(timelineActivityTypes)) {
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
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer hasMaxHeight>
            {timelineActivityTypes.map((timelineActivityType) => (
              <MenuItemMultiSelect
                key={timelineActivityType.universalIdentifier}
                LeftIcon={
                  isDefined(timelineActivityType.icon)
                    ? getIcon(timelineActivityType.icon)
                    : undefined
                }
                text={timelineActivityType.label}
                selected={timelineActivityTypeUniversalIdentifiersFilter.includes(
                  timelineActivityType.universalIdentifier,
                )}
                onSelectChange={(selected) =>
                  handleSelectChange(
                    timelineActivityType.universalIdentifier,
                    selected,
                  )
                }
              />
            ))}
          </DropdownMenuItemsContainer>
          {isNonEmptyArray(timelineActivityTypeUniversalIdentifiersFilter) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <MenuItem
                  LeftIcon={IconFilterOff}
                  text={t`Clear filter`}
                  onClick={() =>
                    setTimelineActivityTypeUniversalIdentifiersFilter([])
                  }
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
