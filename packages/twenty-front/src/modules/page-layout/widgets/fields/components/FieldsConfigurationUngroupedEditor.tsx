import { DragDropProvider } from '@dnd-kit/react';
import { isDefined } from 'twenty-shared/utils';

import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { FIELDS_CONFIGURATION_FIELD_DND_TYPE } from '@/page-layout/widgets/fields/constants/FieldsConfigurationFieldDndType';
import {
  type FieldsConfigurationDndData,
  type FieldsConfigurationFieldDragData,
  type FieldsConfigurationFieldListEndDropData,
} from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderEvents';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconNewSection } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

const UNGROUPED_FIELDS_DROPPABLE_ID = 'ungrouped-fields';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const UNGROUPED_END_DROP_DATA: FieldsConfigurationFieldListEndDropData = {
  type: 'field-list-end',
  groupId: UNGROUPED_FIELDS_DROPPABLE_ID,
};

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

  const handleDragEnd = (
    event: DragDropProviderDragEndEvent<FieldsConfigurationDndData>,
  ) => {
    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;
    const targetData = event.operation.target?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (event.canceled || sourceData?.type !== 'field') {
      return;
    }

    // The drop line renders before the hovered field, so field targets insert
    // the dragged field before them; the end drop zone appends it.
    const dropTargetIndex =
      targetData?.type === 'field'
        ? targetData.index
        : targetData?.type === 'field-list-end'
          ? sortedFields.length
          : null;

    if (!isDefined(dropTargetIndex)) {
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: UNGROUPED_FIELDS_DROPPABLE_ID,
      destinationDroppableId: UNGROUPED_FIELDS_DROPPABLE_ID,
    });

    if (destinationIndex === sourceData.index) {
      return;
    }

    onMoveField(sourceData.index, destinationIndex);
  };

  return (
    <DragDropProvider<FieldsConfigurationDndData>
      sensors={DND_KIT_SENSORS}
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
            <DragDropItemSortableCell
              key={field.fieldMetadataItem.id}
              id={field.fieldMetadataItem.id}
              index={fieldIndex}
              group={UNGROUPED_FIELDS_DROPPABLE_ID}
              data={fieldDragData}
              type={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
              accept={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
              hasTransition={false}
              highlightWhileDragging
              dropLine="horizontal"
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
          );
        })}

        <DragDropItemEndDropZone
          id={`${UNGROUPED_FIELDS_DROPPABLE_ID}-end`}
          accept={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
          data={UNGROUPED_END_DROP_DATA}
        >
          <MenuItem
            LeftIcon={IconNewSection}
            text={t`Add a Group`}
            onClick={onAddGroup}
            withIconContainer
            withIconContainerBackground={false}
          />
        </DragDropItemEndDropZone>
      </StyledFieldsDroppable>
    </DragDropProvider>
  );
};
