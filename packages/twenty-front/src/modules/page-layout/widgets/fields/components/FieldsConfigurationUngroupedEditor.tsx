import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconNewSection } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { FIELDS_CONFIGURATION_FIELD_DND_TYPE } from '@/page-layout/widgets/fields/constants/FieldsConfigurationFieldDndType';
import { type FieldsConfigurationDndData } from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type FieldsConfigurationFieldDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldDragData';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropInsertionContextValues } from '@/ui/utilities/drag-and-drop/hooks/useDragDropInsertionIndex';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

const UNGROUPED_FIELDS_DROPPABLE_ID = 'ungrouped-fields';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationUngroupedEditorProps = {
  ungroupedFields: FieldsWidgetGroupField[];
  onMoveField: (sourceIndex: number, destinationIndex: number) => void;
  onToggleFieldVisibility: (fieldMetadataId: string) => void;
  onAddGroup: () => void;
};

export const FieldsConfigurationUngroupedEditor = ({
  ungroupedFields,
  onMoveField,
  onToggleFieldVisibility,
  onAddGroup,
}: FieldsConfigurationUngroupedEditorProps) => {
  const { t } = useLingui();

  const sortedFields = [...ungroupedFields].sort(
    (a, b) => a.position - b.position,
  );

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const resolveDrop = (
    event:
      | DragDropProviderDragMoveEvent<FieldsConfigurationDndData>
      | DragDropProviderDragEndEvent<FieldsConfigurationDndData>,
  ) =>
    resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => sortedFields.length,
    });

  const handleDragMove = (
    event: DragDropProviderDragMoveEvent<FieldsConfigurationDndData>,
  ) => {
    setActiveDropTargetIndex(resolveDrop(event)?.dropTargetIndex ?? null);
  };

  const handleDragEnd = (
    event: DragDropProviderDragEndEvent<FieldsConfigurationDndData>,
  ) => {
    setActiveDropTargetIndex(null);

    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (event.canceled || sourceData?.type !== 'field') {
      return;
    }

    const resolvedDrop = resolveDrop(event);

    if (!isDefined(resolvedDrop)) {
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: UNGROUPED_FIELDS_DROPPABLE_ID,
      destinationDroppableId: UNGROUPED_FIELDS_DROPPABLE_ID,
    });

    if (destinationIndex === sourceData.index) {
      return;
    }

    onMoveField(sourceData.index, destinationIndex);
  };

  const contextValues: DragDropInsertionContextValues = {
    activeDropTargetIndex,
    activeDroppableId: UNGROUPED_FIELDS_DROPPABLE_ID,
  };

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<FieldsConfigurationDndData>
        sensors={DND_KIT_SENSORS}
        plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <StyledFieldsDroppable>
          {sortedFields.map((field, fieldIndex) => {
            const fieldDragData: FieldsConfigurationFieldDragData = {
              type: 'field',
              groupId: UNGROUPED_FIELDS_DROPPABLE_ID,
              index: fieldIndex,
            };

            return (
              <Fragment key={field.fieldMetadataItem.id}>
                <DragDropItemDropTarget
                  index={fieldIndex}
                  droppableId={UNGROUPED_FIELDS_DROPPABLE_ID}
                  orientation="horizontal"
                  compact
                />
                <DragDropItemSortableCell
                  id={field.fieldMetadataItem.id}
                  index={fieldIndex}
                  group={UNGROUPED_FIELDS_DROPPABLE_ID}
                  data={fieldDragData}
                  type={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
                  accept={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
                  hasTransition={false}
                  highlightWhileDragging
                  orientation="horizontal"
                >
                  <FieldsConfigurationFieldEditor
                    field={{
                      fieldMetadataId: field.fieldMetadataItem.id,
                      position: field.position,
                      isVisible: field.isVisible,
                    }}
                    fieldMetadata={field.fieldMetadataItem}
                    onToggleVisibility={() => {
                      onToggleFieldVisibility(field.fieldMetadataItem.id);
                    }}
                  />
                </DragDropItemSortableCell>
              </Fragment>
            );
          })}

          <DragDropItemDropTarget
            index={sortedFields.length}
            droppableId={UNGROUPED_FIELDS_DROPPABLE_ID}
            orientation="horizontal"
            compact
          />

          <MenuItem
            LeftIcon={IconNewSection}
            text={t`Add a Group`}
            onClick={onAddGroup}
            withIconContainer
            withIconContainerBackground={false}
          />
        </StyledFieldsDroppable>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};