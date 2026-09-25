import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewKey } from '@/views/types/ViewKey';
import {
  ViewType,
  getViewTypeLabel,
  viewTypeIconMapping,
} from '@/views/types/ViewType';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCalendarWeek,
  IconLayoutList,
  IconListDetails,
  IconShare,
  IconTrash,
  IconUser,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

interface ObjectOptionsDropdownCustomViewProps {
  onBackToDefault?: () => void;
}

export const ObjectOptionsDropdownCustomView = ({
  onBackToDefault,
}: ObjectOptionsDropdownCustomViewProps) => {
  const { t } = useLingui();
  const {
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
    dropdownId,
  } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const customViewData = currentView
    ? {
        ...currentView,
        key: null,
        name: currentView.name || t`Custom View`,
      }
    : null;

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );

  const toggleMineFilterFieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === currentView?.toggleMineFilterFieldMetadataId,
  );

  const calendarFieldMetadata = recordIndexCalendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === recordIndexCalendarFieldMetadataId,
      )
    : undefined;

  const viewsOnCurrentObject = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const isDefaultView = currentView?.key === ViewKey.INDEX;
  const isLastView = viewsOnCurrentObject.length <= 1;

  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const visibleFieldsCount = visibleBoardFields.length;

  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
    recordIndexId,
  );

  const handleDelete = () => {
    if (!customViewData?.id) {
      return;
    }
    setViewPickerReferenceViewId(customViewData?.id);
    destroyViewFromCurrentState();
    closeDropdown();
    onBackToDefault?.();
  };

  const selectableItemIdArray = [
    'Layout',
    'Visibility',
    'Fields',
    ...(customViewData?.type === ViewType.CALENDAR
      ? ['CalendarDateField', 'CalendarView']
      : []),
    ...(customViewData?.type !== ViewType.CALENDAR ? ['Group'] : []),
    'ToggleMineFilterField',
    'Delete view',
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  if (!customViewData) {
    return null;
  }

  return (
    <LegacyDropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      <ObjectOptionsDropdownMenuViewName currentView={customViewData} />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Layout"
            onEnter={() => onContentChange('layout')}
          >
            <ListItem
              focused={selectedItemId === 'Layout'}
              onClick={() => onContentChange('layout')}
              startIcon={
                <SelectOptionIcon
                  Icon={viewTypeIconMapping(
                    customViewData?.type ?? ViewType.TABLE,
                  )}
                />
              }
              description={t(getViewTypeLabel(customViewData.type))}
              descriptionPlacement="end"
              hasSubmenu
            >{t`Layout`}</ListItem>
          </SelectableListItem>
          <SelectableListItem
            itemId="Visibility"
            onEnter={() => onContentChange('visibility')}
          >
            <ListItem
              focused={selectedItemId === 'Visibility'}
              onClick={() => onContentChange('visibility')}
              startIcon={<IconShare />}
              description={
                customViewData?.visibility === 'UNLISTED'
                  ? t`Unlisted`
                  : t`Workspace`
              }
              descriptionPlacement="end"
              hasSubmenu
            >{t`Visibility`}</ListItem>
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          {customViewData?.type === ViewType.CALENDAR && (
            <>
              <div id="calendar-date-field-picker-menu-item">
                <SelectableListItem
                  itemId="CalendarDateField"
                  onEnter={() => onContentChange('calendarFields')}
                >
                  <ListItem
                    focused={selectedItemId === 'CalendarDateField'}
                    onClick={() => onContentChange('calendarFields')}
                    startIcon={<IconCalendar />}
                    description={
                      isDefaultView
                        ? t`Not available on Default View`
                        : calendarFieldMetadata?.label
                    }
                    descriptionPlacement="end"
                    hasSubmenu
                    disabled={isDefaultView}
                  >{t`Date field`}</ListItem>
                </SelectableListItem>
              </div>
              <SelectableListItem
                itemId="CalendarView"
                onEnter={() => onContentChange('calendarView')}
              >
                <ListItem
                  focused={selectedItemId === 'CalendarView'}
                  onClick={() => onContentChange('calendarView')}
                  startIcon={<IconCalendarWeek />}
                  description={
                    recordIndexCalendarLayout === ViewCalendarLayout.MONTH
                      ? t`Month`
                      : recordIndexCalendarLayout === ViewCalendarLayout.WEEK
                        ? t`Week`
                        : t`Day`
                  }
                  descriptionPlacement="end"
                >{t`Calendar view`}</ListItem>
              </SelectableListItem>
            </>
          )}
          <SelectableListItem
            itemId="Fields"
            onEnter={() => onContentChange('fields')}
          >
            <ListItem
              focused={selectedItemId === 'Fields'}
              onClick={() => onContentChange('fields')}
              startIcon={<IconListDetails />}
              description={t`${visibleFieldsCount} selected`}
              descriptionPlacement="end"
              hasSubmenu
            >{t`Fields`}</ListItem>
          </SelectableListItem>
          {customViewData?.type !== ViewType.CALENDAR && (
            <Tooltip
              content={t`Not available on Default View`}
              side="bottom"
              maxWidth={'100%'}
              delay={TooltipDelay.mediumDelay}
              disabled={!isDefaultView}
            >
              <div id="group-by-menu-item">
                <SelectableListItem
                  itemId="Group"
                  onEnter={() =>
                    isDefined(recordIndexGroupFieldMetadataItem)
                      ? onContentChange('recordGroups')
                      : onContentChange('recordGroupFields')
                  }
                >
                  <ListItem
                    focused={selectedItemId === 'Group'}
                    onClick={() =>
                      isDefined(recordIndexGroupFieldMetadataItem)
                        ? onContentChange('recordGroups')
                        : onContentChange('recordGroupFields')
                    }
                    startIcon={<IconLayoutList />}
                    description={
                      isDefaultView
                        ? t`Not available on Default View`
                        : recordIndexGroupFieldMetadataItem?.label
                    }
                    descriptionPlacement="end"
                    hasSubmenu
                    disabled={isDefaultView}
                  >{t`Group`}</ListItem>
                </SelectableListItem>
              </div>
            </Tooltip>
          )}
          <SelectableListItem
            itemId="ToggleMineFilterField"
            onEnter={() => onContentChange('toggleMineFilterFields')}
          >
            <ListItem
              focused={selectedItemId === 'ToggleMineFilterField'}
              onClick={() => onContentChange('toggleMineFilterFields')}
              startIcon={<IconUser />}
              description={toggleMineFilterFieldMetadata?.label}
              descriptionPlacement="end"
              hasSubmenu
            >{t`All/Mine field`}</ListItem>
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <Tooltip
            delay={TooltipDelay.mediumDelay}
            content={
              isDefaultView
                ? t`Not available on Default View`
                : t`Cannot delete the only view`
            }
            side="bottom"
            maxWidth={'100%'}
            disabled={!(isDefaultView || isLastView)}
          >
            <div id="delete-view-menu-item">
              <SelectableListItem
                itemId="Delete view"
                onEnter={() => handleDelete()}
              >
                <ListItem
                  focused={selectedItemId === 'Delete view'}
                  onClick={() => handleDelete()}
                  startIcon={<IconTrash />}
                  disabled={isDefaultView || isLastView}
                  color="danger"
                >{t`Delete view`}</ListItem>
              </SelectableListItem>
            </div>
          </Tooltip>
        </DropdownMenuItemsContainer>
      </SelectableList>
    </LegacyDropdownContent>
  );
};
