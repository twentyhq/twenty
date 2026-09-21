import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useSetViewTypeFromLayoutOptionsMenu } from '@/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
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
import {
  getViewTypeLabel,
  ViewType,
  viewTypeIconMapping,
} from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SettingsRow } from 'twenty-ui/components';
import {
  IconBaselineDensitySmall,
  IconCalendar,
  IconCalendarWeek,
  IconChevronLeft,
  IconLayoutList,
  IconTable,
} from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

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

  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
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
    ViewType.LIST,
    ...(!isDefaultView ? [ViewType.CALENDAR] : []),
    ...(isDefaultView ? [] : [ViewType.KANBAN]),
    ...(currentView?.type === ViewType.KANBAN ? ['Group'] : []),
    ...(currentView?.type === ViewType.CALENDAR
      ? ['CalendarView', 'CalendarDateField']
      : []),
    ...(currentView?.type !== ViewType.TABLE &&
    currentView?.type !== ViewType.LIST
      ? ['Compact view']
      : []),
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
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
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          <DropdownMenuItemsContainer scrollable={false}>
            <SelectableListItem
              itemId={ViewType.TABLE}
              onEnter={() => {
                setAndPersistViewType(ViewType.TABLE);
              }}
            >
              <DropdownListItem
                focused={selectedItemId === ViewType.TABLE}
                onClick={async () => {
                  if (currentView?.type !== ViewType.TABLE) {
                    await setAndPersistViewType(ViewType.TABLE);
                  }
                }}
                role="option"
                aria-selected={currentView?.type === ViewType.TABLE}
                selected={currentView?.type === ViewType.TABLE}
                indicator="check"
                startIcon={<IconTable />}
              >
                {t(getViewTypeLabel(ViewType.TABLE))}
              </DropdownListItem>
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.LIST}
              onEnter={() => {
                setAndPersistViewType(ViewType.LIST);
              }}
            >
              <DropdownListItem
                focused={selectedItemId === ViewType.LIST}
                onClick={async () => {
                  if (currentView?.type !== ViewType.LIST) {
                    await setAndPersistViewType(ViewType.LIST);
                  }
                }}
                role="option"
                aria-selected={currentView?.type === ViewType.LIST}
                selected={currentView?.type === ViewType.LIST}
                indicator="check"
                startIcon={
                  <SelectOptionIcon Icon={viewTypeIconMapping(ViewType.LIST)} />
                }
              >
                {t(getViewTypeLabel(ViewType.LIST))}
              </DropdownListItem>
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.CALENDAR}
              onEnter={() => {
                setAndPersistViewType(ViewType.CALENDAR);
              }}
            >
              <DropdownListItem
                focused={selectedItemId === ViewType.CALENDAR}
                onClick={handleSelectCalendarViewType}
                role="option"
                aria-selected={currentView?.type === ViewType.CALENDAR}
                selected={currentView?.type === ViewType.CALENDAR}
                indicator="check"
                startIcon={
                  <SelectOptionIcon
                    Icon={viewTypeIconMapping(ViewType.CALENDAR)}
                  />
                }
              >
                {t(getViewTypeLabel(ViewType.CALENDAR))}
              </DropdownListItem>
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.KANBAN}
              onEnter={() => {
                setAndPersistViewType(ViewType.KANBAN);
              }}
            >
              <DropdownListItem
                disabled={isDefaultView}
                focused={selectedItemId === ViewType.KANBAN}
                onClick={handleSelectKanbanViewType}
                role="option"
                aria-selected={currentView?.type === ViewType.KANBAN}
                selected={currentView?.type === ViewType.KANBAN}
                indicator="check"
                description={
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
                descriptionPlacement={'end'}
                startIcon={
                  <SelectOptionIcon
                    Icon={viewTypeIconMapping(ViewType.KANBAN)}
                  />
                }
              >
                {t(getViewTypeLabel(ViewType.KANBAN))}
              </DropdownListItem>
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
                  <DropdownListItem
                    focused={selectedItemId === 'CalendarDateField'}
                    onClick={() => onContentChange('calendarFields')}
                    startIcon={<IconCalendar />}
                    description={calendarFieldMetadata?.label}
                    descriptionPlacement="end"
                    hasSubmenu
                  >{t`Date field`}</DropdownListItem>
                </SelectableListItem>
                <SelectableListItem
                  itemId="CalendarView"
                  onEnter={() => onContentChange('calendarView')}
                >
                  <DropdownListItem
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
                    hasSubmenu
                  >{t`Calendar view`}</DropdownListItem>
                </SelectableListItem>
              </>
            )}
            {currentView?.type === ViewType.KANBAN && (
              <SelectableListItem
                itemId="Group"
                onEnter={() => {
                  isDefined(recordIndexGroupFieldMetadataItem)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields');
                }}
              >
                <DropdownListItem
                  focused={selectedItemId === 'Group'}
                  onClick={() =>
                    isDefined(recordIndexGroupFieldMetadataItem)
                      ? onContentChange('recordGroups')
                      : onContentChange('recordGroupFields')
                  }
                  startIcon={<IconLayoutList />}
                  description={recordIndexGroupFieldMetadataItem?.label}
                  descriptionPlacement="end"
                  hasSubmenu
                >{t`Group`}</DropdownListItem>
              </SelectableListItem>
            )}
            {currentView?.type !== ViewType.TABLE &&
              currentView?.type !== ViewType.LIST && (
                <SelectableListItem
                  itemId="Compact view"
                  onEnter={() => {
                    setAndPersistIsCompactModeActive(
                      !isCompactModeActive,
                      currentView,
                    );
                  }}
                >
                  <SettingsRow
                    focused={selectedItemId === 'Compact view'}
                    startIcon={<IconBaselineDensitySmall />}
                    onCheckedChange={() =>
                      setAndPersistIsCompactModeActive(
                        !isCompactModeActive,
                        currentView,
                      )
                    }
                    checked={isCompactModeActive}
                  >{t`Compact view`}</SettingsRow>
                </SelectableListItem>
              )}
          </DropdownMenuItemsContainer>
        </SelectableList>
      )}
    </DropdownContent>
  );
};
