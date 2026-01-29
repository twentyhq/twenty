import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconEye, IconEyeOff, IconGripVertical } from 'twenty-ui/display';

const StyledFieldContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledDragHandle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: grab;
  display: flex;

  &:active {
    cursor: grabbing;
  }
`;

const StyledFieldLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledVisibilityToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  outline: none;
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type FieldsConfigurationFieldEditorProps = {
  field: FieldsConfigurationFieldItem;
  fieldMetadata: FieldMetadataItem;
  index: number;
  onToggleVisibility: () => void;
};

export const FieldsConfigurationFieldEditor = ({
  field,
  fieldMetadata,
  index,
  onToggleVisibility,
}: FieldsConfigurationFieldEditorProps) => {
  // Field is visible by default (isVisible !== false)
  const isVisible = field.isVisible !== false;

  const fieldContent = (
    <StyledFieldContainer>
      <StyledDragHandle>
        <IconGripVertical size={16} />
      </StyledDragHandle>
      <StyledFieldLabel>{fieldMetadata.label}</StyledFieldLabel>
      <StyledVisibilityToggle
        onClick={onToggleVisibility}
        title={isVisible ? t`Hide field` : t`Show field`}
      >
        {isVisible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
      </StyledVisibilityToggle>
    </StyledFieldContainer>
  );

  return (
    <DraggableItem
      draggableId={field.fieldMetadataId}
      index={index}
      itemComponent={fieldContent}
    />
  );
};
