import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useRecordTableWidgetFieldCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldCallbacks';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { getRecordTableWidgetIsUIEditable } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetIsUIEditable';
import {
  getRecordTableWidgetLayoutViewType,
  isRecordTableWidgetContentEditingSupported,
  RECORD_TABLE_WIDGET_LAYOUT_OPTIONS,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
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
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useRecordTableSettingsDescriptions } from '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowBarToDownDashed,
  IconArrowsSort,
  IconBox,
  IconCalendar,
  IconCalendarEvent,
  IconEyeOff,
  IconFilter,
  IconLayoutList,
  IconListDetails,
  IconPencil,
} from 'twenty-ui/icon';
import {
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
  const { t } = useLingui();
  const { openDropdown } = useOpenDropdown();

  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
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

  const isUIEditable = getRecordTableWidgetIsUIEditable(
    configuration,
    pageLayoutDraft.type,
  );

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

  const handleIsUIEditableChange = (nextIsUIEditable: boolean) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        isUIEditable: nextIsUIEditable,
      },
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

  const currentLayoutViewType = getRecordTableWidgetLayoutViewType(
    widgetView?.type,
  );
  const isKanbanLayout = currentLayoutViewType === ViewType.KANBAN_WIDGET;
  const isCalendarLayout = currentLayoutViewType === ViewType.CALENDAR_WIDGET;

  const { Icon: CurrentLayoutIcon, label: currentLayoutLabel } =
    RECORD_TABLE_WIDGET_LAYOUT_OPTIONS[currentLayoutViewType];
  const isWidgetContentEditingSupported =
    isRecordTableWidgetContentEditingSupported(widgetView?.type);

  const calendarFieldMetadataId = widgetView?.calendarFieldMetadataId ?? null;

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
          'object-view-layout',
          'record-table-fields',
          'record-table-filter',
          'record-table-sort',
          ...(isCalendarLayout
            ? ['record-table-calendar-field', 'record-table-calendar-layout']
            : ['record-table-group-by']),
          ...(!isCalendarLayout && hasGroupBy
            ? ['record-table-hide-empty-groups']
            : []),
          ...(!isCalendarLayout && !hasGroupBy ? ['record-table-limit'] : []),
          ...(isWidgetContentEditingSupported
            ? ['record-table-allow-editing']
            : []),
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
              <SelectableListItem
                itemId="record-table-source"
                onEnter={() =>
                  openDropdown({
                    dropdownComponentInstanceIdFromProps: 'record-table-source',
                  })
                }
              >
                <DropdownRoot dropdownId="record-table-source" type="picker">
                  <CommandMenuItemDropdownTrigger
                    Icon={IconBox}
                    label={t`Source`}
                    id="record-table-source"
                    description={sourceDescription}
                    contextualTextPosition="right"
                  />
                  <DropdownContent
                    side="bottom"
                    align="end"
                    collisionPadding={{ left: 0, right: 0 }}
                  >
                    <RecordTableDataSourceDropdownContent />
                  </DropdownContent>
                </DropdownRoot>
              </SelectableListItem>
              <SelectableListItem
                itemId="object-view-layout"
                onEnter={
                  hasViewId
                    ? () =>
                        openDropdown({
                          dropdownComponentInstanceIdFromProps:
                            'object-view-layout',
                        })
                    : undefined
                }
              >
                <DropdownRoot dropdownId="object-view-layout" type="picker">
                  <CommandMenuItemDropdownTrigger
                    Icon={CurrentLayoutIcon}
                    label={t`Layout`}
                    id="object-view-layout"
                    description={t(currentLayoutLabel)}
                    disabled={!hasViewId}
                    contextualTextPosition="right"
                  />
                  <DropdownContent
                    side="bottom"
                    align="end"
                    collisionPadding={{ left: 0, right: 0 }}
                  >
                    {hasViewId && (
                      <RecordTableLayoutDropdownContent
                        pageLayoutId={pageLayoutId}
                        widgetId={widgetInEditMode.id}
                        objectMetadataId={widgetInEditMode.objectMetadataId!}
                        currentLayoutViewType={currentLayoutViewType}
                      />
                    )}
                  </DropdownContent>
                </DropdownRoot>
              </SelectableListItem>
              {hasViewId && (
                <>
                  <SelectableListItem
                    itemId="record-table-fields"
                    onEnter={() =>
                      openDropdown({
                        dropdownComponentInstanceIdFromProps:
                          'record-table-fields',
                      })
                    }
                  >
                    <DropdownRoot dropdownId="record-table-fields" type="panel">
                      <CommandMenuItemDropdownTrigger
                        Icon={IconListDetails}
                        label={t`Fields`}
                        id="record-table-fields"
                        description={fieldsDescription}
                        contextualTextPosition="right"
                      />
                      <DropdownContent
                        side="bottom"
                        align="end"
                        collisionPadding={{ left: 0, right: 0 }}
                      >
                        <RecordTableFieldsDropdownContent
                          viewId={viewId}
                          objectMetadataId={widgetInEditMode.objectMetadataId!}
                          onFieldUpdated={handleFieldUpdated}
                          onFieldCreated={handleFieldCreated}
                        />
                      </DropdownContent>
                    </DropdownRoot>
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
                    <SelectableListItem
                      itemId="record-table-calendar-field"
                      onEnter={() =>
                        openDropdown({
                          dropdownComponentInstanceIdFromProps:
                            'record-table-calendar-field',
                        })
                      }
                    >
                      <DropdownRoot
                        dropdownId="record-table-calendar-field"
                        type="picker"
                      >
                        <CommandMenuItemDropdownTrigger
                          Icon={IconCalendarEvent}
                          label={t`Date field`}
                          id="record-table-calendar-field"
                          description={calendarFieldLabel}
                          contextualTextPosition="right"
                        />
                        <DropdownContent
                          side="bottom"
                          align="end"
                          collisionPadding={{ left: 0, right: 0 }}
                        >
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
                      </DropdownRoot>
                    </SelectableListItem>
                  )}
                  {isCalendarLayout && (
                    <SelectableListItem
                      itemId="record-table-calendar-layout"
                      onEnter={() =>
                        openDropdown({
                          dropdownComponentInstanceIdFromProps:
                            'record-table-calendar-layout',
                        })
                      }
                    >
                      <DropdownRoot
                        dropdownId="record-table-calendar-layout"
                        type="picker"
                      >
                        <CommandMenuItemDropdownTrigger
                          Icon={IconCalendar}
                          label={t`Calendar view`}
                          id="record-table-calendar-layout"
                          description={calendarLayoutLabel}
                          contextualTextPosition="right"
                        />
                        <DropdownContent
                          side="bottom"
                          align="end"
                          collisionPadding={{ left: 0, right: 0 }}
                        >
                          <RecordTableCalendarLayoutDropdownContent
                            pageLayoutId={pageLayoutId}
                            widgetId={widgetInEditMode.id}
                            currentCalendarLayout={currentCalendarLayout}
                          />
                        </DropdownContent>
                      </DropdownRoot>
                    </SelectableListItem>
                  )}
                  {!isCalendarLayout && (
                    <SelectableListItem
                      itemId="record-table-group-by"
                      onEnter={() =>
                        openDropdown({
                          dropdownComponentInstanceIdFromProps:
                            'record-table-group-by',
                        })
                      }
                    >
                      <DropdownRoot
                        dropdownId="record-table-group-by"
                        type="picker"
                      >
                        <CommandMenuItemDropdownTrigger
                          Icon={IconLayoutList}
                          label={t`Group by`}
                          id="record-table-group-by"
                          description={mainGroupByFieldLabel}
                          contextualTextPosition="right"
                        />
                        <DropdownContent
                          side="bottom"
                          align="end"
                          collisionPadding={{ left: 0, right: 0 }}
                        >
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
                      </DropdownRoot>
                    </SelectableListItem>
                  )}
                  {!isCalendarLayout && hasGroupBy && (
                    <SelectableListItem itemId="record-table-hide-empty-groups">
                      <CommandMenuItemSwitch
                        LeftIcon={IconEyeOff}
                        text={t`Hide empty groups`}
                        id="record-table-hide-empty-groups"
                        checked={shouldHideEmptyGroups}
                        onCheckedChange={handleShouldHideEmptyGroupsChange}
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
                  {isWidgetContentEditingSupported && (
                    <SelectableListItem itemId="record-table-allow-editing">
                      <CommandMenuItemSwitch
                        LeftIcon={IconPencil}
                        text={t`Allow editing`}
                        id="record-table-allow-editing"
                        checked={isUIEditable}
                        onCheckedChange={handleIsUIEditableChange}
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
