import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetFieldCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldCallbacks';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { RecordTableDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableDataSourceDropdownContent';
import { RecordTableFieldsDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableFieldsDropdownContent';
import { RecordTableGroupByDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableGroupByDropdownContent';
import { RecordTableCalendarFieldDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarFieldDropdownContent';
import { RecordTableCalendarLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarLayoutDropdownContent';
import { RecordTableLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableLayoutDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useRecordTableSettingsDescriptions } from '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowBarToDownDashed,
  IconArrowsSort,
  IconBox,
  IconCalendar,
  IconCalendarEvent,
  IconEyeOff,
  IconFilter,
  IconLayoutKanban,
  IconLayoutList,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
  ViewType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const SidePanelDashboardRecordTableSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const configuration = widgetInEditMode?.configuration;
  const isRecordTableConfiguration =
    configuration?.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const viewId =
    isRecordTableConfiguration &&
    isDefined(configuration) &&
    'viewId' in configuration &&
    isDefined(configuration.viewId)
      ? (configuration.viewId as string)
      : null;

  const limit =
    isRecordTableConfiguration &&
    isDefined(configuration) &&
    'recordLimit' in configuration &&
    isDefined(configuration.recordLimit)
      ? (configuration.recordLimit as number)
      : undefined;

  const {
    sourceDescription,
    fieldsDescription,
    filterDescription,
    sortDescription,
  } = useRecordTableSettingsDescriptions({
    objectMetadataId: widgetInEditMode?.objectMetadataId,
    viewId,
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleLimitChange = (value: number | null) => {
    const nextLimit =
      !isDefined(value) || value < 1 ? undefined : Math.floor(value);

    updateCurrentWidgetConfig({
      configToUpdate: { recordLimit: nextLimit },
    });
  };

  const { handleFieldUpdated, handleFieldCreated } =
    useRecordTableWidgetFieldCallbacks({
      pageLayoutId,
      widgetId: widgetInEditMode?.id ?? '',
      viewId: viewId ?? '',
    });

  const { handleShouldHideEmptyGroupsChange } =
    useRecordTableWidgetLayoutCallbacks({
      pageLayoutId,
      widgetId: widgetInEditMode?.id ?? '',
    });

  const { view: widgetView } = useRecordTableWidgetViewForDisplay({
    viewId: viewId ?? '',
    widgetId: widgetInEditMode?.id ?? '',
    pageLayoutId,
  });

  const mainGroupByFieldMetadataId =
    widgetView?.mainGroupByFieldMetadataId ?? null;
  const shouldHideEmptyGroups = widgetView?.shouldHideEmptyGroups ?? false;

  const isKanbanLayout = widgetView?.type === ViewType.KANBAN_WIDGET;
  const isCalendarLayout = widgetView?.type === ViewType.CALENDAR_WIDGET;
  const currentLayoutViewType = isKanbanLayout
    ? ViewType.KANBAN_WIDGET
    : isCalendarLayout
      ? ViewType.CALENDAR_WIDGET
      : ViewType.TABLE_WIDGET;

  const calendarFieldMetadataId = widgetView?.calendarFieldMetadataId ?? null;

  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );

  const currentCalendarLayout =
    widgetView?.calendarLayout ?? ViewCalendarLayout.MONTH;

  const calendarLayoutLabel =
    currentCalendarLayout === ViewCalendarLayout.DAY
      ? t`Day`
      : currentCalendarLayout === ViewCalendarLayout.WEEK
        ? t`Week`
        : t`Month`;

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === widgetInEditMode?.objectMetadataId,
  );

  const mainGroupByFieldLabel = isDefined(mainGroupByFieldMetadataId)
    ? (objectMetadataItem?.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === mainGroupByFieldMetadataId,
      )?.label ?? t`None`)
    : t`None`;

  const calendarFieldLabel = isDefined(calendarFieldMetadataId)
    ? (objectMetadataItem?.fields.find(
        (fieldMetadataItem) => fieldMetadataItem.id === calendarFieldMetadataId,
      )?.label ?? t`None`)
    : t`None`;

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const hasViewId = isDefined(viewId);
  const hasGroupBy = isDefined(mainGroupByFieldMetadataId);

  const selectableItemIds = [
    'record-table-source',
    ...(hasViewId
      ? [
          'record-table-fields',
          'record-table-filter',
          'record-table-sort',
          ...(isCalendarLayout
            ? [
                'record-table-calendar-field',
                ...(isCalendarWeekViewEnabled
                  ? ['record-table-calendar-layout']
                  : []),
              ]
            : ['record-table-group-by']),
          ...(!isCalendarLayout && hasGroupBy
            ? ['record-table-hide-empty-groups']
            : []),
          ...(!isCalendarLayout && !hasGroupBy ? ['record-table-limit'] : []),
        ]
      : []),
  ];

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFilter);
  };

  const handleSortClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableSort);
  };

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <StyledSettingsContainer>
          <SidePanelList selectableItemIds={selectableItemIds}>
            <SidePanelGroup heading={t`Settings`}>
              <SelectableListItem itemId="record-table-source">
                <CommandMenuItemDropdown
                  Icon={IconBox}
                  label={t`Source`}
                  id="record-table-source"
                  dropdownId="record-table-source"
                  dropdownComponents={
                    <DropdownContent>
                      <RecordTableDataSourceDropdownContent />
                    </DropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  description={sourceDescription}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              <SelectableListItem itemId="object-view-layout">
                <CommandMenuItemDropdown
                  Icon={
                    isKanbanLayout
                      ? IconLayoutKanban
                      : isCalendarLayout
                        ? IconCalendar
                        : IconTable
                  }
                  label={t`Layout`}
                  id="object-view-layout"
                  dropdownId="object-view-layout"
                  dropdownComponents={
                    hasViewId ? (
                      <DropdownContent>
                        <RecordTableLayoutDropdownContent
                          pageLayoutId={pageLayoutId}
                          widgetId={widgetInEditMode.id}
                          objectMetadataId={widgetInEditMode.objectMetadataId!}
                          currentLayoutViewType={currentLayoutViewType}
                        />
                      </DropdownContent>
                    ) : (
                      <></>
                    )
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu={hasViewId}
                  description={
                    isKanbanLayout
                      ? t`Kanban`
                      : isCalendarLayout
                        ? t`Calendar`
                        : t`Table`
                  }
                  disabled={!hasViewId}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              {hasViewId && (
                <>
                  <SelectableListItem itemId="record-table-fields">
                    <CommandMenuItemDropdown
                      Icon={IconListDetails}
                      label={t`Fields`}
                      id="record-table-fields"
                      dropdownId="record-table-fields"
                      dropdownComponents={
                        <RecordTableFieldsDropdownContent
                          viewId={viewId}
                          objectMetadataId={widgetInEditMode.objectMetadataId!}
                          onFieldUpdated={handleFieldUpdated}
                          onFieldCreated={handleFieldCreated}
                        />
                      }
                      dropdownPlacement="bottom-end"
                      hasSubMenu
                      description={fieldsDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-filter"
                    onEnter={handleFilterClick}
                  >
                    <CommandMenuItem
                      id="record-table-filter"
                      label={t`Filter`}
                      Icon={IconFilter}
                      hasSubMenu
                      onClick={handleFilterClick}
                      description={filterDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-sort"
                    onEnter={handleSortClick}
                  >
                    <CommandMenuItem
                      id="record-table-sort"
                      label={t`Sort`}
                      Icon={IconArrowsSort}
                      hasSubMenu
                      onClick={handleSortClick}
                      description={sortDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  {isCalendarLayout && (
                    <SelectableListItem itemId="record-table-calendar-field">
                      <CommandMenuItemDropdown
                        Icon={IconCalendarEvent}
                        label={t`Date field`}
                        id="record-table-calendar-field"
                        dropdownId="record-table-calendar-field"
                        dropdownComponents={
                          <DropdownContent>
                            <RecordTableCalendarFieldDropdownContent
                              pageLayoutId={pageLayoutId}
                              widgetId={widgetInEditMode.id}
                              objectMetadataId={
                                widgetInEditMode.objectMetadataId!
                              }
                              currentCalendarFieldMetadataId={
                                calendarFieldMetadataId
                              }
                            />
                          </DropdownContent>
                        }
                        dropdownPlacement="bottom-end"
                        hasSubMenu
                        description={calendarFieldLabel}
                        contextualTextPosition="right"
                      />
                    </SelectableListItem>
                  )}
                  {isCalendarLayout && isCalendarWeekViewEnabled && (
                    <SelectableListItem itemId="record-table-calendar-layout">
                      <CommandMenuItemDropdown
                        Icon={IconCalendar}
                        label={t`Calendar view`}
                        id="record-table-calendar-layout"
                        dropdownId="record-table-calendar-layout"
                        dropdownComponents={
                          <DropdownContent>
                            <RecordTableCalendarLayoutDropdownContent
                              pageLayoutId={pageLayoutId}
                              widgetId={widgetInEditMode.id}
                              currentCalendarLayout={currentCalendarLayout}
                            />
                          </DropdownContent>
                        }
                        dropdownPlacement="bottom-end"
                        hasSubMenu
                        description={calendarLayoutLabel}
                        contextualTextPosition="right"
                      />
                    </SelectableListItem>
                  )}
                  {!isCalendarLayout && (
                    <SelectableListItem itemId="record-table-group-by">
                      <CommandMenuItemDropdown
                        Icon={IconLayoutList}
                        label={t`Group by`}
                        id="record-table-group-by"
                        dropdownId="record-table-group-by"
                        dropdownComponents={
                          <DropdownContent>
                            <RecordTableGroupByDropdownContent
                              pageLayoutId={pageLayoutId}
                              widgetId={widgetInEditMode.id}
                              objectMetadataId={
                                widgetInEditMode.objectMetadataId!
                              }
                              currentMainGroupByFieldMetadataId={
                                mainGroupByFieldMetadataId
                              }
                              isClearable={!isKanbanLayout}
                            />
                          </DropdownContent>
                        }
                        dropdownPlacement="bottom-end"
                        hasSubMenu
                        description={mainGroupByFieldLabel}
                        contextualTextPosition="right"
                      />
                    </SelectableListItem>
                  )}
                  {!isCalendarLayout && hasGroupBy && (
                    <SelectableListItem itemId="record-table-hide-empty-groups">
                      <CommandMenuItemToggle
                        LeftIcon={IconEyeOff}
                        text={t`Hide empty groups`}
                        id="record-table-hide-empty-groups"
                        toggled={shouldHideEmptyGroups}
                        onToggleChange={handleShouldHideEmptyGroupsChange}
                      />
                    </SelectableListItem>
                  )}
                  {!isCalendarLayout && !hasGroupBy && (
                    <SelectableListItem itemId="record-table-limit">
                      <CommandMenuItemNumberInput
                        id="record-table-limit"
                        label={t`Limit`}
                        Icon={IconArrowBarToDownDashed}
                        value={isDefined(limit) ? `${limit}` : ''}
                        onChange={handleLimitChange}
                        placeholder={t`No limit`}
                      />
                    </SelectableListItem>
                  )}
                </>
              )}
            </SidePanelGroup>
          </SidePanelList>
        </StyledSettingsContainer>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
