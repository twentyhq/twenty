import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState, useEffect, useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { H2Title, IconGripVertical } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';

const StyledFieldItem = styled.div<{ isDragging: boolean }>`
  align-items: center;
  background-color: ${({ theme, isDragging }) =>
    isDragging ? theme.background.transparent.light : theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: grab;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  &:active {
    cursor: grabbing;
  }
`;

const StyledFieldName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledFieldType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-left: auto;
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
`;

type SettingsDetailFieldOrderSectionProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsDetailFieldOrderSection = ({
  objectMetadataItem,
}: SettingsDetailFieldOrderSectionProps) => {
  const { t } = useLingui();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  // Get all available fields for this object, excluding label identifier and unsupported fields
  const availableFields = useMemo(() => {
    return objectMetadataItem.fields
      .filter(
        (field) =>
          isFieldCellSupported(field, objectMetadataItems) &&
          field.id !== labelIdentifierFieldMetadataItem?.id &&
          field.name !== 'createdAt' &&
          field.name !== 'deletedAt' &&
          field.type !== FieldMetadataType.RICH_TEXT_V2,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [objectMetadataItem.fields, objectMetadataItems, labelIdentifierFieldMetadataItem]);

  // Initialize ordered fields based on saved order or default alphabetical
  const [orderedFieldIds, setOrderedFieldIds] = useState<string[]>(() => {
    if (objectMetadataItem.detailFieldOrder && objectMetadataItem.detailFieldOrder.length > 0) {
      // Filter out any field IDs that no longer exist
      const validFieldIds = objectMetadataItem.detailFieldOrder.filter((id) =>
        availableFields.some((field) => field.id === id),
      );
      // Add any new fields that aren't in the saved order
      const newFieldIds = availableFields
        .filter((field) => !validFieldIds.includes(field.id))
        .map((field) => field.id);
      return [...validFieldIds, ...newFieldIds];
    }
    return availableFields.map((field) => field.id);
  });

  // Update ordered fields when available fields change
  useEffect(() => {
    const currentFieldIds = new Set(orderedFieldIds);
    const availableFieldIds = new Set(availableFields.map((f) => f.id));

    // Check if we need to update (fields added or removed)
    const needsUpdate =
      orderedFieldIds.some(id => !availableFieldIds.has(id)) ||
      availableFields.some(field => !currentFieldIds.has(field.id));

    if (needsUpdate) {
      const validFieldIds = orderedFieldIds.filter((id) =>
        availableFieldIds.has(id),
      );
      const newFieldIds = availableFields
        .filter((field) => !currentFieldIds.has(field.id))
        .map((field) => field.id);
      setOrderedFieldIds([...validFieldIds, ...newFieldIds]);
    }
  }, [availableFields, orderedFieldIds]);

  const orderedFields = useMemo(() => {
    return orderedFieldIds
      .map((id) => availableFields.find((field) => field.id === id))
      .filter((field): field is NonNullable<typeof field> => field !== undefined);
  }, [orderedFieldIds, availableFields]);

  const handleDragEnd: OnDragEndResponder = async (result) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    // Reorder the fields
    const newOrderedFieldIds = Array.from(orderedFieldIds);
    const [movedFieldId] = newOrderedFieldIds.splice(sourceIndex, 1);
    newOrderedFieldIds.splice(destinationIndex, 0, movedFieldId);

    setOrderedFieldIds(newOrderedFieldIds);

    // Save to backend
    const updateResult = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { detailFieldOrder: newOrderedFieldIds },
    });

    if (updateResult.status === 'successful') {
      enqueueSuccessSnackBar({
        message: t`Field order updated`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Detail View Field Order`}
        description={t`Drag and drop to reorder how fields appear in the detail view`}
      />
      <DraggableList
        onDragEnd={handleDragEnd}
        draggableItems={
          <>
            {orderedFields.map((field, index) => (
              <DraggableItem
                key={field.id}
                draggableId={field.id}
                index={index}
                itemComponent={({ isDragging }) => (
                  <StyledFieldItem isDragging={isDragging}>
                    <StyledIconContainer>
                      <IconGripVertical size={16} />
                    </StyledIconContainer>
                    <StyledFieldName>{field.label}</StyledFieldName>
                    <StyledFieldType>{field.type}</StyledFieldType>
                  </StyledFieldItem>
                )}
              />
            ))}
          </>
        }
      />
    </Section>
  );
};
