import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import {
  getRecordTableWidgetLayoutViewType,
  RECORD_TABLE_WIDGET_LAYOUT_OPTIONS,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { RecordTableCalendarFieldDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarFieldDropdownContent';
import { RecordTableCalendarLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarLayoutDropdownContent';
import { RecordTableGroupByDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableGroupByDropdownContent';
import { RecordTableLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableLayoutDropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCalendarEvent,
  IconEyeOff,
  IconLayoutList,
} from 'twenty-ui/icon';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';

type WidgetViewLayoutSettingsRowsProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  viewId: string;
  isLayoutRowHidden?: boolean;
};

export const WidgetViewLayoutSettingsRows = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  viewId,
  isLayoutRowHidden = false,
}: WidgetViewLayoutSettingsRowsProps) => {
  const { t } = useLingui();
  const { openDropdown } = useOpenDropdown();

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

  const currentLayoutViewType = getRecordTableWidgetLayoutViewType(
    widgetView?.type,
  );
  const isKanbanLayout = currentLayoutViewType === ViewType.KANBAN_WIDGET;
  const isCalendarLayout = currentLayoutViewType === ViewType.CALENDAR_WIDGET;

  const { Icon: CurrentLayoutIcon, label: currentLayoutLabel } =
    RECORD_TABLE_WIDGET_LAYOUT_OPTIONS[currentLayoutViewType];

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
        <SelectableListItem
          itemId="object-view-layout"
          onEnter={() =>
            openDropdown({
              dropdownComponentInstanceIdFromProps: 'object-view-layout',
            })
          }
        >
          <DropdownRoot dropdownId="object-view-layout" type="picker">
            <CommandMenuItemDropdownTrigger
              Icon={CurrentLayoutIcon}
              label={t`Layout`}
              id="object-view-layout"
              description={t(currentLayoutLabel)}
              contextualTextPosition="right"
            />
            <DropdownContent
              side="bottom"
              align="end"
              collisionPadding={{ left: 0, right: 0 }}
            >
              <RecordTableLayoutDropdownContent
                pageLayoutId={pageLayoutId}
                widgetId={widgetId}
                objectMetadataId={objectMetadataId}
                currentLayoutViewType={currentLayoutViewType}
              />
            </DropdownContent>
          </DropdownRoot>
        </SelectableListItem>
      )}
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
          <DropdownRoot dropdownId="record-table-calendar-field" type="picker">
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
                widgetId={widgetId}
                objectMetadataId={objectMetadataId}
                currentCalendarFieldMetadataId={calendarFieldMetadataId}
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
          <DropdownRoot dropdownId="record-table-calendar-layout" type="picker">
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
                widgetId={widgetId}
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
              dropdownComponentInstanceIdFromProps: 'record-table-group-by',
            })
          }
        >
          <DropdownRoot dropdownId="record-table-group-by" type="picker">
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
                widgetId={widgetId}
                objectMetadataId={objectMetadataId}
                currentMainGroupByFieldMetadataId={mainGroupByFieldMetadataId}
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
    </>
  );
};
