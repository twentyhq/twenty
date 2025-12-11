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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
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
import { ViewCalendarLayout } from '~/generated/graphql';

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

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const recordIndexCalendarLayout = useRecoilValue(
    recordIndexCalendarLayoutState,
  );
  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const { setAndPersistViewType } = useSetViewTypeFromLayoutOptionsMenu();
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();
  const { closeDropdown } = useCloseDropdown();

  const handleSelectKanbanViewType = async () => {
    if (isDefaultView) {
      return;
    }
    if (availableFieldsForKanban.length === 0) {
      navigateToSelectSettings();
      closeDropdown(dropdownId);
      return;
    }
    if (currentView?.type !== ViewType.Kanban) {
      await setAndPersistViewType(ViewType.Kanban);
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
    if (currentView?.type !== ViewType.Calendar) {
      await setAndPersistViewType(ViewType.Calendar);
    }
  };

  const isDefaultView = currentView?.key === 'INDEX';
  const nbsp = '\u00A0';

  const selectableItemIdArray = [
    ViewType.Table,
    ...(isDefaultView ? [] : [ViewType.Kanban]),
    ...(!isDefaultView ? [ViewType.Calendar] : []),
    ViewOpenRecordInType.SIDE_PANEL,
    ...(currentView?.type === ViewType.Kanban ? ['Group'] : []),
    ...(currentView?.type === ViewType.Calendar
      ? ['CalendarView', 'CalendarDateField']
      : []),
    ...(currentView?.type !== ViewType.Table ? ['Compact view'] : []),
  ];

  const selectedItemId = useRecoilComponentValue(
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
              itemId={ViewType.Table}
              onEnter={() => {
                setAndPersistViewType(ViewType.Table);
              }}
            >
              <MenuItemSelect
                LeftIcon={IconTable}
                text={t`Table`}
                selected={currentView?.type === ViewType.Table}
                focused={selectedItemId === ViewType.Table}
                onClick={async () => {
                  if (currentView?.type !== ViewType.Table) {
                    await setAndPersistViewType(ViewType.Table);
                  }
                }}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.Calendar}
              onEnter={() => {
                setAndPersistViewType(ViewType.Calendar);
              }}
            >
              <MenuItemSelect
                LeftIcon={viewTypeIconMapping(ViewType.Calendar)}
                text={t`Calendar`}
                selected={currentView?.type === ViewType.Calendar}
                focused={selectedItemId === ViewType.Calendar}
                onClick={handleSelectCalendarViewType}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.Kanban}
              onEnter={() => {
                setAndPersistViewType(ViewType.Kanban);
              }}
            >
              <MenuItemSelect
                LeftIcon={viewTypeIconMapping(ViewType.Kanban)}
                text={t`Kanban`}
                disabled={isDefaultView}
                focused={selectedItemId === ViewType.Kanban}
                contextualText={
                  isDefaultView ? (
                    <>
                      {nbsp}·{nbsp}
                      <OverflowingTextWithTooltip
                        text={t`Not available for default view`}
                      />
                    </>
                  ) : availableFieldsForKanban.length === 0 ? (
                    t`Create Select...`
                  ) : undefined
                }
                contextualTextPosition="right"
                selected={currentView?.type === ViewType.Kanban}
                onClick={handleSelectKanbanViewType}
              />
            </SelectableListItem>
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            {currentView?.type === ViewType.Calendar && (
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
              itemId={ViewOpenRecordInType.SIDE_PANEL}
              onEnter={() => {
                onContentChange('layoutOpenIn');
              }}
            >
              <MenuItem
                focused={selectedItemId === ViewOpenRecordInType.SIDE_PANEL}
                LeftIcon={
                  recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                    ? IconLayoutSidebarRight
                    : IconLayoutNavbar
                }
                text={t`Open in`}
                onClick={() => {
                  onContentChange('layoutOpenIn');
                }}
                contextualText={
                  recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                    ? t`Side Panel`
                    : t`Record Page`
                }
                contextualTextPosition="right"
                hasSubMenu
              />
            </SelectableListItem>
            {currentView?.type === ViewType.Kanban && (
              <SelectableListItem
                itemId="Group"
                onEnter={() => {
                  isDefined(recordGroupFieldMetadata)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields');
                }}
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
                  contextualText={recordGroupFieldMetadata?.label}
                  contextualTextPosition="right"
                  hasSubMenu
                />
              </SelectableListItem>
            )}
            {currentView?.type !== ViewType.Table && (
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
