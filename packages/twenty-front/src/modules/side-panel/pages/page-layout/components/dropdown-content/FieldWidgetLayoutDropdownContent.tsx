import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
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
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
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
import { ListItemButton } from 'twenty-ui/components/navigation';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

const DISPLAY_MODE_ICONS: Record<FieldDisplayMode, IconComponent> = {
  [FieldDisplayMode.FIELD]: IconListDetails,
  [FieldDisplayMode.CARD]: IconId,
  [FieldDisplayMode.EDITOR]: IconFileText,
  [FieldDisplayMode.VIEW]: IconListDetails,
  [FieldDisplayMode.TABLE]: IconTable,
};

// Picking an embedded-view layout implicitly selects the TABLE display mode
export const FieldWidgetLayoutDropdownContent = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutSidePanelTarget();

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
  const currentViewId = isDefined(fieldConfiguration)
    ? getWidgetConfigurationViewId(fieldConfiguration)
    : null;

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

  // Gate on the configured id, not resolution: a widget whose second hop was deleted must not fall back to first-hop behavior
  const isNestedRelationWidget = isDefined(
    currentNestedRelationFieldMetadataId,
  );

  const availableDisplayModes = fieldMetadataItem
    ? getFieldWidgetAvailableDisplayModes(
        fieldMetadataItem.type,
        fieldMetadataItem.relation?.type,
      )
    : [FieldDisplayMode.FIELD];

  // Inline display modes would render the first hop's field, contradicting the nested widget's two-hop title
  const inlineDisplayModes = isNestedRelationWidget
    ? []
    : availableDisplayModes.filter(
        (displayMode) => displayMode !== FieldDisplayMode.TABLE,
      );

  const relationTraversal =
    isNestedRelationWidget && !isDefined(resolvedNestedRelation)
      ? undefined
      : getFieldWidgetRelationTraversal({
          sourceFieldMetadataItem: fieldMetadataItem,
          nestedRelationFieldMetadataItem:
            resolvedNestedRelation?.nestedRelationFieldMetadataItem,
          objectMetadataItems,
        });

  const targetObjectMetadataId = relationTraversal?.targetObjectMetadataId;
  const inverseFieldMetadataId = relationTraversal?.inverseFieldMetadataId;
  const relationTargetFieldMetadataId =
    relationTraversal?.relationTargetFieldMetadataId ?? null;

  // Every embedded layout scopes its view by the relation's inverse field, so none are offered when it cannot resolve
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

    // A view on another object predates junction traversal and an unresolved id was deleted, so both are replaced
    const isCurrentViewOnTargetObject =
      isDefined(currentViewId) &&
      isDefined(embeddedWidgetView) &&
      embeddedWidgetView.objectMetadataId === targetObjectMetadataId;

    const viewId =
      (isCurrentViewOnTargetObject ? currentViewId : undefined) ??
      (isDefined(targetObjectMetadataId) && isDefined(inverseFieldMetadataId)
        ? addDraftViewForFieldRelationTableWidget({
            widgetId: widgetInEditMode.id,
            targetObjectMetadataId,
            inverseFieldMetadataId,
            relationTargetFieldMetadataId,
          })
        : undefined);

    // Draft view creation fails without the target object, so keep the current display mode
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
            <ListItemButton
              focused={selectedItemId === displayMode}
              onClick={() => {
                handleSelectDisplayMode(displayMode);
              }}
              role="option"
              aria-selected={currentDisplayMode === displayMode}
              selected={currentDisplayMode === displayMode}
              indicator="check"
              startIcon={
                <SelectOptionIcon Icon={DISPLAY_MODE_ICONS[displayMode]} />
              }
            >
              {displayModeLabels[displayMode]}
            </ListItemButton>
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
