import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { timelineActivityTypeIdsFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeIdsFilterFamilyState';
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
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconFilterOff, useIcons } from 'twenty-ui/icon';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

export const WidgetActionTimelineFilter = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { getIcon } = useIcons();
  const { timelineActivityTypeById } = useTimelineActivityTypes();

  const timelineActivityTypeIdsFilter = useAtomFamilyStateValue(
    timelineActivityTypeIdsFilterFamilyState,
    targetRecord.id,
  );
  const setTimelineActivityTypeIdsFilter = useSetAtomFamilyState(
    timelineActivityTypeIdsFilterFamilyState,
    targetRecord.id,
  );

  // Action-less types rely on a custom renderer and do not map to the built-in
  // event categories exposed by this filter.
  const filterableTimelineActivityTypes = [
    ...timelineActivityTypeById.values(),
  ].filter((timelineActivityType) => isDefined(timelineActivityType.action));

  if (filterableTimelineActivityTypes.length === 0) {
    return null;
  }

  const handleSelectChange = (
    timelineActivityTypeId: string,
    selected: boolean,
  ) =>
    setTimelineActivityTypeIdsFilter(
      selected
        ? [...timelineActivityTypeIdsFilter, timelineActivityTypeId]
        : timelineActivityTypeIdsFilter.filter(
            (selectedId) => selectedId !== timelineActivityTypeId,
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
            {filterableTimelineActivityTypes.map((timelineActivityType) => (
              <MenuItemMultiSelect
                key={timelineActivityType.id}
                LeftIcon={
                  isDefined(timelineActivityType.icon)
                    ? getIcon(timelineActivityType.icon)
                    : undefined
                }
                text={timelineActivityType.label}
                selected={timelineActivityTypeIdsFilter.includes(
                  timelineActivityType.id,
                )}
                onSelectChange={(selected) =>
                  handleSelectChange(timelineActivityType.id, selected)
                }
              />
            ))}
          </DropdownMenuItemsContainer>
          {timelineActivityTypeIdsFilter.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <MenuItem
                  LeftIcon={IconFilterOff}
                  text={t`Clear filter`}
                  onClick={() => setTimelineActivityTypeIdsFilter([])}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
