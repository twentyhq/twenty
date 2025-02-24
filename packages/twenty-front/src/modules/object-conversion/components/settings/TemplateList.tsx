import { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconTrash, IconGripVertical, IconPencil } from '@/ui/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';

import { GET_CONVERSION_TEMPLATES } from '../../graphql/queries';
import {
  DELETE_CONVERSION_TEMPLATE,
  REORDER_CONVERSION_TEMPLATES,
} from '../../graphql/mutations';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTemplateItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  gap: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledDragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledContent = styled.div`
  flex: 1;
`;

const StyledTemplateName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledTemplateDescription = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledObjectTypes = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

interface TemplateListProps {
  onEditTemplate: (templateId: string) => void;
}

export const TemplateList = ({ onEditTemplate }: TemplateListProps) => {
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading } = useQuery(GET_CONVERSION_TEMPLATES);

  const [deleteTemplate] = useMutation(DELETE_CONVERSION_TEMPLATE, {
    refetchQueries: ['GetConversionTemplates'],
    onCompleted: () => {
      enqueueSnackBar('Template deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackBar(error.message, { variant: 'error' });
    },
  });

  const [reorderTemplates] = useMutation(REORDER_CONVERSION_TEMPLATES);

  const handleDelete = useCallback(
    (templateId: string) => {
      deleteTemplate({ variables: { templateId } });
    },
    [deleteTemplate],
  );

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const items = Array.from(data.conversionTemplates);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      reorderTemplates({
        variables: {
          templateIds: items.map((item) => item.id),
        },
        optimisticResponse: {
          reorderConversionTemplates: items.map((item, index) => ({
            id: item.id,
            orderIndex: index,
            __typename: 'ConversionTemplate',
          })),
        },
      });
    },
    [data?.conversionTemplates, reorderTemplates],
  );

  if (loading) return <div>Loading...</div>;

  return (
    <StyledContainer>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="templates">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {data?.conversionTemplates.map((template: any, index: number) => (
                <Draggable
                  key={template.id}
                  draggableId={template.id}
                  index={index}
                >
                  {(provided) => (
                    <StyledTemplateItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <StyledDragHandle {...provided.dragHandleProps}>
                        <IconGripVertical />
                      </StyledDragHandle>
                      <StyledContent>
                        <StyledTemplateInfo>
                          <StyledTemplateName>{template.name}</StyledTemplateName>
                          <StyledObjectTypes>
                            {template.sourceObjectMetadataId} →{' '}
                            {template.targetObjectMetadataId}
                          </StyledObjectTypes>
                        </StyledTemplateInfo>
                        <StyledTemplateDescription>
                          {template.description || 'No description'}
                        </StyledTemplateDescription>
                      </StyledContent>
                      <StyledActions>
                        <IconButton
                          onClick={() => onEditTemplate(template.id)}
                          variant="tertiary"
                          icon={<IconPencil />}
                        />
                        <IconButton
                          onClick={() => handleDelete(template.id)}
                          variant="tertiary"
                          icon={<IconTrash />}
                        />
                      </StyledActions>
                    </StyledTemplateItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </StyledContainer>
  );
};
