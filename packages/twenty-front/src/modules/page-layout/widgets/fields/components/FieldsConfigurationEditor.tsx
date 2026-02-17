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
import { useFieldsWidgetEditorGroupsData } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetEditorGroupsData';
import { useReorderFieldsWidgetEditorGroups } from '@/page-layout/widgets/fields/hooks/useReorderFieldsWidgetEditorGroups';
import { useLingui } from '@lingui/react/macro';
import { type FieldsConfiguration } from '~/generated-metadata/graphql';

const StyledGroupsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationEditorProps = {
  configuration: FieldsConfiguration;
  onChange: (configuration: FieldsConfiguration) => void;
};

export const FieldsConfigurationEditor = ({
  configuration,
}: FieldsConfigurationEditorProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { groups } = useFieldsWidgetEditorGroupsData({
    viewId: configuration.viewId ?? null,
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { createGroup } = useCreateFieldsWidgetEditorGroup({
    viewId: configuration.viewId ?? null,
    groups,
  });

  const { reorderGroups } = useReorderFieldsWidgetEditorGroups();

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
    const sortedGroups = [...groups].sort((a, b) => a.position - b.position);

    const reorderedGroupIds = sortedGroups.map((g) => g.id);
    const [movedGroupId] = reorderedGroupIds.splice(sourceIndex, 1);
    reorderedGroupIds.splice(destinationIndex, 0, movedGroupId);

    reorderGroups(reorderedGroupIds);
  };

  const handleFieldMove = (
    sourceGroupId: string,
    destinationGroupId: string,
    _sourceIndex: number,
    _destinationIndex: number,
  ) => {
    // TODO: Implement field move via ViewField mutations
  };

  const handleAddGroup = async () => {
    const newGroupName = t`New Group`;
    await createGroup(newGroupName);
  };

  const sortedGroups = [...groups].sort((a, b) => a.position - b.position);

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
