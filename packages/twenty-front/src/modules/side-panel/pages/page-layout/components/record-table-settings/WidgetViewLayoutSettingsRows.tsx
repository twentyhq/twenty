import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { RecordTableCalendarFieldDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarFieldDropdownContent';
import { RecordTableCalendarLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarLayoutDropdownContent';
import { RecordTableGroupByDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableGroupByDropdownContent';
import { RecordTableLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableLayoutDropdownContent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCalendarEvent,
  IconEyeOff,
  IconLayoutKanban,
  IconLayoutList,
  IconTable,
} from 'twenty-ui/icon';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
  ViewType,
} from '~/generated-metadata/graphql';

type WidgetViewLayoutSettingsRowsProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  viewId: string;
  isLayoutRowHidden?: boolean;
};

// The embedded-view layout rows (layout type + group-by / calendar field /
// calendar view / hide-empty-groups) shared by widgets backed by a record table
// view: dashboard record table widgets and relation field widgets in table
// display mode. The source object is passed in (fixed to the relation target
// for field widgets), so this component makes no assumption about where the
// widget lives. Hosts that surface the layout choice elsewhere (the field
// widget's merged layout picker) hide the layout row via isLayoutRowHidden.
export const WidgetViewLayoutSettingsRows = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  viewId,
  isLayoutRowHidden = false,
}: WidgetViewLayoutSettingsRowsProps) => {
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );

  const { handleShouldHideEmptyGroupsChange } =
    useRecordTableWidgetLayoutCallbacks({
      pageLayoutId,
      widgetId,
    });

  const { view: widgetView } = useRecordTableWidgetViewForDisplay({
    viewId,
    widgetId,
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
      objectMetadataItemToFind.id === objectMetadataId,
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

  const hasGroupBy = isDefined(mainGroupByFieldMetadataId);

  return (
    <>
      {!isLayoutRowHidden && (
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
              <DropdownContent>
                <RecordTableLayoutDropdownContent
                  pageLayoutId={pageLayoutId}
                  widgetId={widgetId}
                  objectMetadataId={objectMetadataId}
                  currentLayoutViewType={currentLayoutViewType}
                />
              </DropdownContent>
            }
            dropdownPlacement="bottom-end"
            hasSubMenu
            description={
              isKanbanLayout
                ? t`Kanban`
                : isCalendarLayout
                  ? t`Calendar`
                  : t`Table`
            }
            contextualTextPosition="right"
          />
        </SelectableListItem>
      )}
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
                  widgetId={widgetId}
                  objectMetadataId={objectMetadataId}
                  currentCalendarFieldMetadataId={calendarFieldMetadataId}
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
                  widgetId={widgetId}
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
                  widgetId={widgetId}
                  objectMetadataId={objectMetadataId}
                  currentMainGroupByFieldMetadataId={mainGroupByFieldMetadataId}
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
    </>
  );
};
