import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { getFieldWidgetAvailableDisplayModes } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { getFieldWidgetEffectiveDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetEffectiveDisplayMode';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { resolveFieldWidgetNestedRelation } from '@/page-layout/widgets/field/utils/resolveFieldWidgetNestedRelation';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutPickerOptions';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import {
  getRecordTableWidgetLayoutViewType,
  type RecordTableWidgetLayoutViewType,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import {
  getSelectableLayoutViewTypes,
  isSelectableLayout,
} from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { RecordTableWidgetLayoutMenuItems } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableWidgetLayoutMenuItems';
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
  IconFileText,
  IconId,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

const DISPLAY_MODE_ICONS: Record<FieldDisplayMode, IconComponent> = {
  [FieldDisplayMode.FIELD]: IconListDetails,
  [FieldDisplayMode.CARD]: IconId,
  [FieldDisplayMode.EDITOR]: IconFileText,
  [FieldDisplayMode.VIEW]: IconListDetails,
  [FieldDisplayMode.TABLE]: IconTable,
};

// One flat picker: inline display modes followed by the embedded-view layouts.
// Picking a layout selects the TABLE display mode under the hood — users choose
// "Kanban" directly instead of "Table" first and a layout second.
export const FieldWidgetLayoutDropdownContent = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentDisplayMode = isDefined(fieldConfiguration)
    ? getFieldWidgetEffectiveDisplayMode(fieldConfiguration)
    : undefined;
  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentNestedRelationFieldMetadataId =
    fieldConfiguration?.nestedRelationFieldMetadataId;
  const currentViewId = fieldConfiguration?.viewId ?? null;

  const { fieldMetadataItem } = useFieldMetadataItemById(
    currentFieldMetadataId ?? '',
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const resolvedNestedRelation = resolveFieldWidgetNestedRelation({
    objectMetadataItems,
    relationTargetObjectMetadataId:
      fieldMetadataItem?.relation?.targetObjectMetadata.id,
    nestedRelationFieldMetadataId: currentNestedRelationFieldMetadataId,
  });

  // Gate on the configured id, not on resolution success: a widget whose
  // second hop was deleted must not fall back to first-hop behavior.
  const isNestedRelationWidget = isDefined(
    currentNestedRelationFieldMetadataId,
  );

  const availableDisplayModes = fieldMetadataItem
    ? getFieldWidgetAvailableDisplayModes(
        fieldMetadataItem.type,
        fieldMetadataItem.relation?.type,
      )
    : [FieldDisplayMode.FIELD];

  // A nested relation widget only makes sense as an embedded view: inline
  // display modes would render the first hop's relation field, contradicting
  // the widget's two-hop title.
  const inlineDisplayModes = isNestedRelationWidget
    ? []
    : availableDisplayModes.filter(
        (displayMode) => displayMode !== FieldDisplayMode.TABLE,
      );

  // A configured but unresolvable second hop yields no traversal at all, so a
  // stale nested widget cannot fall back to scoping by its first hop.
  const relationTraversal =
    isNestedRelationWidget && !isDefined(resolvedNestedRelation)
      ? undefined
      : getFieldWidgetRelationTraversal({
          sourceFieldMetadataItem: fieldMetadataItem,
          nestedRelationFieldMetadataItem:
            resolvedNestedRelation?.nestedRelationFieldMetadataItem,
        });

  const targetObjectMetadataId = relationTraversal?.targetObjectMetadataId;
  const inverseFieldMetadataId = relationTraversal?.inverseFieldMetadataId;
  const relationTargetFieldMetadataId =
    relationTraversal?.relationTargetFieldMetadataId ?? null;

  // Every embedded layout renders a view scoped by the relation's inverse
  // field, so a relation the traversal cannot resolve offers none of them
  // rather than entries that would leave the widget with nothing to render.
  const hasEmbeddedViewLayouts =
    availableDisplayModes.includes(FieldDisplayMode.TABLE) &&
    isDefined(targetObjectMetadataId) &&
    isDefined(inverseFieldMetadataId);

  const targetObjectMetadataItem = isNestedRelationWidget
    ? resolvedNestedRelation?.nestedRelationTargetObjectMetadataItem
    : objectMetadataItems.find(
        (objectMetadataItemToFind) =>
          objectMetadataItemToFind.id === targetObjectMetadataId,
      );

  const {
    layoutOptions,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  } = useRecordTableWidgetLayoutPickerOptions(targetObjectMetadataItem);

  const { view: embeddedWidgetView } = useRecordTableWidgetViewForDisplay({
    viewId: currentViewId ?? '',
    widgetId: widgetInEditMode?.id ?? '',
    pageLayoutId,
  });

  const isTableDisplayMode = currentDisplayMode === FieldDisplayMode.TABLE;

  const currentEmbeddedViewType = getRecordTableWidgetLayoutViewType(
    embeddedWidgetView?.type,
  );

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
    if (!isSelectableLayout(layoutOptions, targetViewType)) {
      return;
    }

    const viewId =
      currentViewId ??
      (isDefined(targetObjectMetadataId) && isDefined(inverseFieldMetadataId)
        ? addDraftViewForFieldRelationTableWidget({
            widgetId: widgetInEditMode.id,
            targetObjectMetadataId,
            inverseFieldMetadataId,
            relationTargetFieldMetadataId,
          })
        : undefined);

    // Creating the draft view still fails if the target object is not loaded,
    // and switching to the table display mode without one would leave the
    // widget with nothing to render, so it keeps the display mode it has.
    if (!isDefined(viewId)) {
      closeDropdown();
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldDisplayMode: FieldDisplayMode.TABLE,
        viewId,
      },
    });

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
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={[
          ...inlineDisplayModes,
          ...(hasEmbeddedViewLayouts
            ? getSelectableLayoutViewTypes(layoutOptions)
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
          <RecordTableWidgetLayoutMenuItems
            layoutOptions={layoutOptions}
            selectedViewType={
              isTableDisplayMode ? currentEmbeddedViewType : undefined
            }
            focusedItemId={selectedItemId}
            onSelect={handleSelectViewLayout}
          />
        )}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
