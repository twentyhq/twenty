import { TIMELINE_ACTIVITY_TYPE_CREATE_MENU_ITEM_BY_NAME } from '@/activities/timeline-activities/constants/TimelineActivityTypeCreateMenuItemByName';
import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionTimelineCreate = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { timelineActivityTypeById } = useTimelineActivityTypes();
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = `timeline-create-${targetRecord.id}`;

  const creatableTimelineActivityTypes = [
    ...timelineActivityTypeById.values(),
  ].filter((timelineActivityType) =>
    isDefined(
      TIMELINE_ACTIVITY_TYPE_CREATE_MENU_ITEM_BY_NAME[
        timelineActivityType.name
      ],
    ),
  );

  if (creatableTimelineActivityTypes.length === 0) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <WidgetCardHeaderActionButton
          Icon={IconPlus}
          label={t`Add to timeline`}
        />
      }
      dropdownPlacement="bottom-end"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            {creatableTimelineActivityTypes.map((timelineActivityType) => {
              const CreateMenuItem =
                TIMELINE_ACTIVITY_TYPE_CREATE_MENU_ITEM_BY_NAME[
                  timelineActivityType.name
                ];

              return isDefined(CreateMenuItem) ? (
                <CreateMenuItem
                  key={timelineActivityType.id}
                  timelineActivityType={timelineActivityType}
                  onActionStarted={() => closeDropdown(dropdownId)}
                />
              ) : null;
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
