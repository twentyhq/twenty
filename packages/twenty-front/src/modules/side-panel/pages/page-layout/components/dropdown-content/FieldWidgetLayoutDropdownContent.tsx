import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { getFieldWidgetAvailableDisplayModes } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import {
  type RecordTableWidgetLayoutViewType,
  useRecordTableWidgetLayoutCallbacks,
} from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconCalendar,
  IconFileText,
  IconId,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  FieldDisplayMode,
  ViewType,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

const DISPLAY_MODE_ICONS: Record<FieldDisplayMode, IconComponent> = {
  [FieldDisplayMode.FIELD]: IconListDetails,
  [FieldDisplayMode.CARD]: IconId,
  [FieldDisplayMode.EDITOR]: IconFileText,
  [FieldDisplayMode.VIEW]: IconListDetails,
  [FieldDisplayMode.TABLE]: IconTable,
};

// One flat picker: inline display modes (Field / Card / Editor) followed by the
// embedded-view layouts (Table / Kanban / Calendar). Picking a layout selects
// the TABLE display mode under the hood — users choose "Kanban" directly
// instead of "Table" first and a layout second.
export const FieldWidgetLayoutDropdownContent = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;
  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentViewId = fieldConfiguration?.viewId ?? null;

  const { fieldMetadataItem } = useFieldMetadataItemById(
    currentFieldMetadataId ?? '',
  );

  const availableDisplayModes = fieldMetadataItem
    ? getFieldWidgetAvailableDisplayModes(
        fieldMetadataItem.type,
        fieldMetadataItem.relation?.type,
      )
    : [FieldDisplayMode.FIELD];

  const inlineDisplayModes = availableDisplayModes.filter(
    (displayMode) => displayMode !== FieldDisplayMode.TABLE,
  );
  const hasEmbeddedViewLayouts = availableDisplayModes.includes(
    FieldDisplayMode.TABLE,
  );

  const targetObjectMetadataId =
    fieldMetadataItem?.relation?.targetObjectMetadata.id;
  const inverseFieldMetadataId =
    fieldMetadataItem?.relation?.targetFieldMetadata.id;

  const { objectMetadataItems } = useObjectMetadataItems();
  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === targetObjectMetadataId,
  );

  const defaultGroupByFieldMetadataItem =
    (targetObjectMetadataItem?.readableFields ?? []).find(
      isFieldMetadataItemAvailableAsWidgetGroupByField,
    ) ?? null;

  const defaultCalendarFieldMetadataItem =
    (targetObjectMetadataItem?.readableFields ?? []).find(
      isFieldMetadataItemAvailableAsCalendarField,
    ) ?? null;

  const isKanbanAvailable = isDefined(defaultGroupByFieldMetadataItem);
  const isCalendarAvailable = isDefined(defaultCalendarFieldMetadataItem);

  const { view: embeddedWidgetView } = useRecordTableWidgetViewForDisplay({
    viewId: currentViewId ?? '',
    widgetId: widgetInEditMode?.id ?? '',
    pageLayoutId,
  });

  const isTableDisplayMode = currentDisplayMode === FieldDisplayMode.TABLE;

  const currentEmbeddedViewType: RecordTableWidgetLayoutViewType =
    embeddedWidgetView?.type === ViewType.KANBAN_WIDGET
      ? ViewType.KANBAN_WIDGET
      : embeddedWidgetView?.type === ViewType.CALENDAR_WIDGET
        ? ViewType.CALENDAR_WIDGET
        : ViewType.TABLE_WIDGET;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { addDraftViewForFieldRelationTableWidget } =
    useAddDraftViewForFieldRelationTableWidget(pageLayoutId);

  const { handleLayoutChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId: widgetInEditMode?.id ?? '',
  });

  const { closeDropdown } = useCloseDropdown();

  const handleSelectDisplayMode = (fieldDisplayMode: FieldDisplayMode) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldDisplayMode,
      },
    });
    closeDropdown();
  };

  const handleSelectViewLayout = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
    if (!isDefined(widgetInEditMode)) {
      return;
    }
    if (targetViewType === ViewType.KANBAN_WIDGET && !isKanbanAvailable) {
      return;
    }
    if (targetViewType === ViewType.CALENDAR_WIDGET && !isCalendarAvailable) {
      return;
    }

    if (
      !isDefined(currentViewId) &&
      isDefined(targetObjectMetadataId) &&
      isDefined(inverseFieldMetadataId)
    ) {
      const viewId = addDraftViewForFieldRelationTableWidget(
        widgetInEditMode.id,
        targetObjectMetadataId,
        inverseFieldMetadataId,
      );

      updateCurrentWidgetConfig({
        configToUpdate: {
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId,
        },
      });
    } else {
      updateCurrentWidgetConfig({
        configToUpdate: {
          fieldDisplayMode: FieldDisplayMode.TABLE,
        },
      });
    }

    handleLayoutChange({
      targetViewType,
      defaultGroupByFieldMetadataItem,
      defaultCalendarFieldMetadataItem,
    });
    closeDropdown();
  };

  const displayModeLabels: Record<string, string> = {
    [FieldDisplayMode.FIELD]: t`Field`,
    [FieldDisplayMode.CARD]: t`Card`,
    [FieldDisplayMode.EDITOR]: t`Editor`,
  };

  return (
    <DropdownMenuItemsContainer>
      {/* The widget's draft snapshot is normally seeded by the table-family
          renderer; while displayed as Field/Card that renderer isn't mounted,
          so seed the draft here (idempotent) for direct e.g. Card -> Kanban
          switches. */}
      {isDefined(currentViewId) && isDefined(widgetInEditMode) && (
        <RecordTableWidgetViewDraftInitEffect
          widgetId={widgetInEditMode.id}
          viewId={currentViewId}
        />
      )}
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={[
          ...inlineDisplayModes,
          ...(hasEmbeddedViewLayouts
            ? [
                ViewType.TABLE_WIDGET,
                ...(isKanbanAvailable ? [ViewType.KANBAN_WIDGET] : []),
                ...(isCalendarAvailable ? [ViewType.CALENDAR_WIDGET] : []),
              ]
            : []),
        ]}
      >
        {inlineDisplayModes.map((displayMode) => (
          <SelectableListItem
            key={displayMode}
            itemId={displayMode}
            onEnter={() => {
              handleSelectDisplayMode(displayMode);
            }}
          >
            <MenuItemSelect
              text={displayModeLabels[displayMode]}
              selected={currentDisplayMode === displayMode}
              focused={selectedItemId === displayMode}
              LeftIcon={DISPLAY_MODE_ICONS[displayMode]}
              onClick={() => {
                handleSelectDisplayMode(displayMode);
              }}
            />
          </SelectableListItem>
        ))}
        {hasEmbeddedViewLayouts && (
          <>
            <SelectableListItem
              itemId={ViewType.TABLE_WIDGET}
              onEnter={() => handleSelectViewLayout(ViewType.TABLE_WIDGET)}
            >
              <MenuItemSelect
                text={t`Table`}
                LeftIcon={IconTable}
                selected={
                  isTableDisplayMode &&
                  currentEmbeddedViewType === ViewType.TABLE_WIDGET
                }
                focused={selectedItemId === ViewType.TABLE_WIDGET}
                onClick={() => handleSelectViewLayout(ViewType.TABLE_WIDGET)}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.KANBAN_WIDGET}
              onEnter={() => handleSelectViewLayout(ViewType.KANBAN_WIDGET)}
            >
              <MenuItemSelect
                text={t`Kanban`}
                LeftIcon={IconLayoutKanban}
                disabled={!isKanbanAvailable}
                contextualText={
                  !isKanbanAvailable ? t`Needs a Select field` : undefined
                }
                contextualTextPosition="right"
                selected={
                  isTableDisplayMode &&
                  currentEmbeddedViewType === ViewType.KANBAN_WIDGET
                }
                focused={selectedItemId === ViewType.KANBAN_WIDGET}
                onClick={() => handleSelectViewLayout(ViewType.KANBAN_WIDGET)}
              />
            </SelectableListItem>
            <SelectableListItem
              itemId={ViewType.CALENDAR_WIDGET}
              onEnter={() => handleSelectViewLayout(ViewType.CALENDAR_WIDGET)}
            >
              <MenuItemSelect
                text={t`Calendar`}
                LeftIcon={IconCalendar}
                disabled={!isCalendarAvailable}
                contextualText={
                  !isCalendarAvailable ? t`Needs a Date field` : undefined
                }
                contextualTextPosition="right"
                selected={
                  isTableDisplayMode &&
                  currentEmbeddedViewType === ViewType.CALENDAR_WIDGET
                }
                focused={selectedItemId === ViewType.CALENDAR_WIDGET}
                onClick={() => handleSelectViewLayout(ViewType.CALENDAR_WIDGET)}
              />
            </SelectableListItem>
          </>
        )}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
