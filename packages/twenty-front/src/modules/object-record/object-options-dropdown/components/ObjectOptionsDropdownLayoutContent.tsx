import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useSetViewTypeFromLayoutOptionsMenu } from '@/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBaselineDensitySmall,
  IconCalendar,
  IconCalendarWeek,
  IconChevronLeft,
  IconLayoutList,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconTable,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { MenuItem, MenuItemSelect, MenuItemToggle } from 'twenty-ui/navigation';
import {
  ViewCalendarLayout,
  ViewOpenRecordIn,
} from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownLayoutContent = () => {
  const { t } = useLingui();

  const { objectMetadataItem, resetContent, onContentChange, dropdownId } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const setAndPersistIsCompactModeActive = useCallback(
    (isCompactModeActive: boolean, view: GraphQLView | undefined) => {
      if (!view) return;
      updateCurrentView({
        isCompact: isCompactModeActive,
      });
    },
    [updateCurrentView],
  );

  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );
  const recordIndexCalendarLayout = useAtomStateValue(
    recordIndexCalendarLayoutState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const { setAndPersistViewType } = useSetViewTypeFromLayoutOptionsMenu();
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();
  const { closeDropdown } = useCloseDropdown();

  const handleSelectKanbanViewType = async () => {
    if (isDefaultView) {
      return;
    }
    if (availableFieldsForGrouping.length === 0) {
      navigateToSelectSettings();
      closeDropdown(dropdownId);
      return;
    }
    if (currentView?.type !== ViewType.KANBAN) {
      await setAndPersistViewType(ViewType.KANBAN);
    }
  };

  const handleSelectCalendarViewType = async () => {
    if (isDefaultView) {
      return;
    }
    if (availableFieldsForCalendar.length === 0) {
      navigateToDateFieldSettings();
      closeDropdown(dropdownId);
      return;
    }
    if (currentView?.type !== ViewType.CALENDAR) {
      await setAndPersistViewType(ViewType.CALENDAR);
    }
  };

  const isDefaultView = currentView?.key === 'INDEX';
  const nbsp = '\u00A0';

  const selectableItemIdArray = [
    ViewType.TABLE,
    ...(isDefaultView ? [] : [ViewType.KANBAN]),
    ...(!isDefaultView ? [ViewType.CALENDAR] : []),
    ViewOpenRecordIn.SIDE_PANEL,
    ...(currentView?.type === ViewType.KANBAN ? ['Group'] : []),
    ...(currentView?.type === ViewType.CALENDAR
      ? ['CalendarView', 'CalendarDateField']
      : []),
    ...(currentView?.type !== ViewType.TABLE ? ['Compact view'] : []),
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Layout`}
      </DropdownMenuHeader>

      {!!currentView && (
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <DropdownMenuItemsContainer scrollable={false}>
            <SelectableListItem
              itemId={ViewType.TABLE}
              onEnter={() => {
                setAndPersistViewType(ViewType.TABLE);
              }}
            >
              <MenuItemSelect
                LeftIcon={IconTable}
                text={t`Table`}
                selected={currentView?.type === ViewType.TABLE}
                focused={selectedItemId === ViewType.TABLE}
                onClick={async () => {
                  if (currentView?.type !== ViewType.TABLE) {
                    await setAndPersistViewType(ViewType.TABLE);
                  }
                }}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.CALENDAR}
              onEnter={() => {
                setAndPersistViewType(ViewType.CALENDAR);
              }}
            >
              <MenuItemSelect
                LeftIcon={viewTypeIconMapping(ViewType.CALENDAR)}
                text={t`Calendar`}
                selected={currentView?.type === ViewType.CALENDAR}
                focused={selectedItemId === ViewType.CALENDAR}
                onClick={handleSelectCalendarViewType}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.KANBAN}
              onEnter={() => {
                setAndPersistViewType(ViewType.KANBAN);
              }}
            >
              <MenuItemSelect
                LeftIcon={viewTypeIconMapping(ViewType.KANBAN)}
                text={t`Kanban`}
                disabled={isDefaultView}
                focused={selectedItemId === ViewType.KANBAN}
                contextualText={
                  isDefaultView ? (
                    <>
                      {nbsp}·{nbsp}
                      <OverflowingTextWithTooltip
                        text={t`Not available for default view`}
                      />
                    </>
                  ) : availableFieldsForGrouping.length === 0 ? (
                    t`Create Select...`
                  ) : undefined
                }
                contextualTextPosition="right"
                selected={currentView?.type === ViewType.KANBAN}
                onClick={handleSelectKanbanViewType}
              />
            </SelectableListItem>
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            {currentView?.type === ViewType.CALENDAR && (
              <>
                <SelectableListItem
                  itemId="CalendarDateField"
                  onEnter={() => onContentChange('calendarFields')}
                >
                  <MenuItem
                    focused={selectedItemId === 'CalendarDateField'}
                    onClick={() => onContentChange('calendarFields')}
                    LeftIcon={IconCalendar}
                    text={t`Date field`}
                    contextualText={calendarFieldMetadata?.label}
                    contextualTextPosition="right"
                    hasSubMenu
                  />
                </SelectableListItem>
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
                    hasSubMenu
                  />
                </SelectableListItem>
              </>
            )}
            <SelectableListItem
              itemId={ViewOpenRecordIn.SIDE_PANEL}
              onEnter={() => {
                onContentChange('layoutOpenIn');
              }}
            >
              <MenuItem
                focused={selectedItemId === ViewOpenRecordIn.SIDE_PANEL}
                LeftIcon={
                  recordIndexOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL
                    ? IconLayoutSidebarRight
                    : IconLayoutNavbar
                }
                text={t`Open in`}
                onClick={() => {
                  onContentChange('layoutOpenIn');
                }}
                contextualText={
                  recordIndexOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL
                    ? t`Side Panel`
                    : t`Record Page`
                }
                contextualTextPosition="right"
                hasSubMenu
              />
            </SelectableListItem>
            {currentView?.type === ViewType.KANBAN && (
              <SelectableListItem
                itemId="Group"
                onEnter={() => {
                  isDefined(recordIndexGroupFieldMetadataItem)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields');
                }}
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
                  contextualText={recordIndexGroupFieldMetadataItem?.label}
                  contextualTextPosition="right"
                  hasSubMenu
                />
              </SelectableListItem>
            )}
            {currentView?.type !== ViewType.TABLE && (
              <SelectableListItem
                itemId="Compact view"
                onEnter={() => {
                  setAndPersistIsCompactModeActive(
                    !isCompactModeActive,
                    currentView,
                  );
                }}
              >
                <MenuItemToggle
                  focused={selectedItemId === 'Compact view'}
                  LeftIcon={IconBaselineDensitySmall}
                  onToggleChange={() =>
                    setAndPersistIsCompactModeActive(
                      !isCompactModeActive,
                      currentView,
                    )
                  }
                  toggled={isCompactModeActive}
                  text={t`Compact view`}
                  toggleSize="small"
                />
              </SelectableListItem>
            )}
          </DropdownMenuItemsContainer>
        </SelectableList>
      )}
    </DropdownContent>
  );
};
