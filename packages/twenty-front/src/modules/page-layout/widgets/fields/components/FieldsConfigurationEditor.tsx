import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { FieldsConfigurationGroupEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupEditor';
import { useCreateFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useCreateFieldsWidgetEditorGroup';
import { useFieldsWidgetGroupsDraft } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroupsDraft';
import { useMoveFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveFieldInDraft';
import { useReorderFieldsWidgetEditorGroups } from '@/page-layout/widgets/fields/hooks/useReorderFieldsWidgetEditorGroups';
import { useToggleFieldVisibilityInDraft } from '@/page-layout/widgets/fields/hooks/useToggleFieldVisibilityInDraft';
import { useLingui } from '@lingui/react/macro';

const StyledGroupsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationEditorProps = {
  pageLayoutId: string;
  widgetId: string;
};

export const FieldsConfigurationEditor = ({
  pageLayoutId,
  widgetId,
}: FieldsConfigurationEditorProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { draftGroups } = useFieldsWidgetGroupsDraft({
    pageLayoutId,
    widgetId,
  });

  const { createGroup } = useCreateFieldsWidgetEditorGroup({
    pageLayoutId,
    widgetId,
  });

  const { reorderGroups } = useReorderFieldsWidgetEditorGroups({
    pageLayoutId,
    widgetId,
  });

  const { moveField } = useMoveFieldInDraft({
    pageLayoutId,
    widgetId,
  });

  const { toggleFieldVisibility } = useToggleFieldVisibilityInDraft({
    pageLayoutId,
    widgetId,
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'GROUP') {
      handleGroupReorder(source.index, destination.index);
    } else if (type === 'FIELD') {
      handleFieldMove(
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index,
      );
    }
  };

  const handleGroupReorder = (
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const sortedGroups = [...draftGroups].sort(
      (a, b) => a.position - b.position,
    );

    const reorderedGroupIds = sortedGroups.map((g) => g.id);
    const [movedGroupId] = reorderedGroupIds.splice(sourceIndex, 1);
    reorderedGroupIds.splice(destinationIndex, 0, movedGroupId);

    reorderGroups(reorderedGroupIds);
  };

  const handleFieldMove = (
    sourceGroupId: string,
    destinationGroupId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const cleanSourceGroupId = sourceGroupId.replace('group-', '');
    const cleanDestinationGroupId = destinationGroupId.replace('group-', '');

    moveField(
      cleanSourceGroupId,
      cleanDestinationGroupId,
      sourceIndex,
      destinationIndex,
    );
  };

  const handleAddGroup = () => {
    const newGroupName = t`New Group`;
    createGroup(newGroupName);
  };

  const sortedGroups = [...draftGroups].sort((a, b) => a.position - b.position);

  if (sortedGroups.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="groups" type="GROUP">
        {(provided) => (
          <StyledGroupsDroppable
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {sortedGroups.map((group, index) => (
              <Draggable
                key={group.id}
                draggableId={`group-draggable-${group.id}`}
                index={index}
              >
                {(draggableProvided, snapshot) => (
                  <FieldsConfigurationGroupEditor
                    group={group}
                    index={index}
                    objectMetadataItem={objectMetadataItem}
                    draggableProvided={draggableProvided}
                    isDragging={snapshot.isDragging}
                    onAddGroup={handleAddGroup}
                    onToggleFieldVisibility={(fieldMetadataId) =>
                      toggleFieldVisibility(group.id, fieldMetadataId)
                    }
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledGroupsDroppable>
        )}
      </Droppable>
    </DragDropContext>
  );
};
