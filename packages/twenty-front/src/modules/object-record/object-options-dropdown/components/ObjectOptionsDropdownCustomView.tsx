import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconCalendar,
  IconCalendarWeek,
  IconLayoutList,
  IconListDetails,
  IconShare,
  IconTrash,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ViewCalendarLayout } from '~/generated/graphql';

interface ObjectOptionsDropdownCustomViewProps {
  onBackToDefault?: () => void;
}

export const ObjectOptionsDropdownCustomView = ({
  onBackToDefault,
}: ObjectOptionsDropdownCustomViewProps) => {
  const { t } = useLingui();
  const { recordIndexId, objectMetadataItem, onContentChange, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const customViewData = currentView
    ? {
        ...currentView,
        key: ViewKey.Custom,
        name: currentView.name || t`Custom View`,
      }
    : null;

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const isDefaultView = currentView?.key === ViewKey.Index;

  const recordIndexCalendarLayout = useRecoilValue(
    recordIndexCalendarLayoutState,
  );

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const visibleFieldsCount = visibleBoardFields.length;

  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
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
    ...(customViewData?.type === ViewType.Calendar
      ? ['CalendarDateField', 'CalendarView']
      : []),
    ...(customViewData?.type !== ViewType.Calendar ? ['Group'] : []),
    'Delete view',
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  if (!customViewData) {
    return null;
  }

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      <ObjectOptionsDropdownMenuViewName currentView={customViewData} />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
        focusId={OBJECT_OPTIONS_DROPDOWN_ID}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Layout"
            onEnter={() => onContentChange('layout')}
          >
            <MenuItem
              focused={selectedItemId === 'Layout'}
              onClick={() => onContentChange('layout')}
              LeftIcon={viewTypeIconMapping(
                customViewData?.type ?? ViewType.Table,
              )}
              text={t`Layout`}
              contextualText={`${capitalize(customViewData?.type ?? '')}`}
              contextualTextPosition="right"
              hasSubMenu
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="Visibility"
            onEnter={() => onContentChange('visibility')}
          >
            <MenuItem
              focused={selectedItemId === 'Visibility'}
              onClick={() => onContentChange('visibility')}
              LeftIcon={IconShare}
              text={t`Visibility`}
              contextualText={
                customViewData?.visibility === 'UNLISTED'
                  ? t`Unlisted`
                  : t`Workspace`
              }
              contextualTextPosition="right"
              hasSubMenu
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          {customViewData?.type === ViewType.Calendar && (
            <>
              <div id="calendar-date-field-picker-menu-item">
                <SelectableListItem
                  itemId="CalendarDateField"
                  onEnter={() => onContentChange('calendarFields')}
                >
                  <MenuItem
                    focused={selectedItemId === 'CalendarDateField'}
                    onClick={() => onContentChange('calendarFields')}
                    LeftIcon={IconCalendar}
                    text={t`Date field`}
                    contextualText={
                      isDefaultView
                        ? t`Not available on Default View`
                        : calendarFieldMetadata?.label
                    }
                    contextualTextPosition="right"
                    hasSubMenu
                    disabled={isDefaultView}
                  />
                </SelectableListItem>
              </div>
              <SelectableListItem
                itemId="CalendarView"
                onEnter={() => onContentChange('calendarView')}
              >
                <MenuItem
                  focused={selectedItemId === 'CalendarView'}
                  onClick={() => onContentChange('calendarView')}
                  LeftIcon={IconCalendarWeek}
                  text={t`Calendar view`}
                  contextualText={
                    recordIndexCalendarLayout === ViewCalendarLayout.MONTH
                      ? t`Month`
                      : recordIndexCalendarLayout === ViewCalendarLayout.WEEK
                        ? t`Week`
                        : t`Day`
                  }
                  contextualTextPosition="right"
                />
              </SelectableListItem>
            </>
          )}
          <SelectableListItem
            itemId="Fields"
            onEnter={() => onContentChange('fields')}
          >
            <MenuItem
              focused={selectedItemId === 'Fields'}
              onClick={() => onContentChange('fields')}
              LeftIcon={IconListDetails}
              text={t`Fields`}
              contextualText={t`${visibleFieldsCount} shown`}
              contextualTextPosition="right"
              hasSubMenu
            />
          </SelectableListItem>
          {customViewData?.type !== ViewType.Calendar && (
            <div id="group-by-menu-item">
              <SelectableListItem
                itemId="Group"
                onEnter={() =>
                  isDefined(recordGroupFieldMetadata)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields')
                }
              >
                <MenuItem
                  focused={selectedItemId === 'Group'}
                  onClick={() =>
                    isDefined(recordGroupFieldMetadata)
                      ? onContentChange('recordGroups')
                      : onContentChange('recordGroupFields')
                  }
                  LeftIcon={IconLayoutList}
                  text={t`Group`}
                  contextualText={
                    isDefaultView
                      ? t`Not available on Default View`
                      : recordGroupFieldMetadata?.label
                  }
                  contextualTextPosition="right"
                  hasSubMenu
                  disabled={isDefaultView}
                />
              </SelectableListItem>
            </div>
          )}
          {isDefaultView && (
            <AppTooltip
              anchorSelect={`#group-by-menu-item`}
              content={t`Not available on Default View`}
              noArrow
              place="bottom"
              width="100%"
            />
          )}
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <div id="delete-view-menu-item">
            <SelectableListItem
              itemId="Delete view"
              onEnter={() => handleDelete()}
            >
              <MenuItem
                focused={selectedItemId === 'Delete view'}
                onClick={() => handleDelete()}
                LeftIcon={IconTrash}
                text={t`Delete view`}
                disabled={isDefaultView}
              />
            </SelectableListItem>
          </div>
          {isDefaultView && (
            <AppTooltip
              anchorSelect={`#delete-view-menu-item`}
              content={t`Not available on Default View`}
              noArrow
              place="bottom"
              width="100%"
            />
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
