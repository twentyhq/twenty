import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewKey } from '@/views/types/ViewKey';
import {
  getViewTypeLabel,
  ViewType,
  viewTypeIconMapping,
} from '@/views/types/ViewType';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCalendarWeek,
  IconLayoutList,
  IconListDetails,
  IconShare,
  IconTrash,
} from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';
import { MenuItem } from 'twenty-ui/navigation';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

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
        key: null,
        name: currentView.name || t`Custom View`,
      }
    : null;

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const calendarEndFieldMetadata = currentView?.calendarEndFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarEndFieldMetadataId,
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
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );
  const supportedCalendarLayout = getSupportedRecordCalendarLayout({
    calendarLayout: recordIndexCalendarLayout,
    isCalendarWeekViewEnabled,
  });

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
      ? [
          'CalendarDateField',
          ...(isCalendarWeekViewEnabled ? ['CalendarEndDateField'] : []),
          'CalendarView',
        ]
      : []),
    ...(customViewData?.type !== ViewType.CALENDAR ? ['Group'] : []),
    'Delete view',
  ];

  const selectedItemId = useAtomComponentStateValue(
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
                customViewData?.type ?? ViewType.TABLE,
              )}
              text={t`Layout`}
              contextualText={t(getViewTypeLabel(customViewData.type))}
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
          {customViewData?.type === ViewType.CALENDAR && (
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
              {isCalendarWeekViewEnabled && (
                <div id="calendar-end-date-field-picker-menu-item">
                  <SelectableListItem
                    itemId="CalendarEndDateField"
                    onEnter={() => onContentChange('calendarEndFields')}
                  >
                    <MenuItem
                      focused={selectedItemId === 'CalendarEndDateField'}
                      onClick={() => onContentChange('calendarEndFields')}
                      LeftIcon={IconCalendar}
                      text={t`End date field`}
                      contextualText={
                        isDefaultView
                          ? t`Not available on Default View`
                          : (calendarEndFieldMetadata?.label ?? t`None`)
                      }
                      contextualTextPosition="right"
                      hasSubMenu
                      disabled={isDefaultView}
                    />
                  </SelectableListItem>
                </div>
              )}
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
                    supportedCalendarLayout === ViewCalendarLayout.MONTH
                      ? t`Month`
                      : supportedCalendarLayout === ViewCalendarLayout.WEEK
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
          {customViewData?.type !== ViewType.CALENDAR && (
            <div id="group-by-menu-item">
              <SelectableListItem
                itemId="Group"
                onEnter={() =>
                  isDefined(recordIndexGroupFieldMetadataItem)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields')
                }
              >
                <MenuItem
                  focused={selectedItemId === 'Group'}
                  onClick={() =>
                    isDefined(recordIndexGroupFieldMetadataItem)
                      ? onContentChange('recordGroups')
                      : onContentChange('recordGroupFields')
                  }
                  LeftIcon={IconLayoutList}
                  text={t`Group`}
                  contextualText={
                    isDefaultView
                      ? t`Not available on Default View`
                      : recordIndexGroupFieldMetadataItem?.label
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
                disabled={isDefaultView || isLastView}
                accent="danger"
              />
            </SelectableListItem>
          </div>
          {(isDefaultView || isLastView) && (
            <AppTooltip
              anchorSelect={`#delete-view-menu-item`}
              content={
                isDefaultView
                  ? t`Not available on Default View`
                  : t`Cannot delete the only view`
              }
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
