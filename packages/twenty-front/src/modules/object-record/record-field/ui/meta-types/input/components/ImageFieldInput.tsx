import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useImageField } from '@/object-record/record-field/ui/meta-types/hooks/useImageField';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import styled from '@emotion/styled';
import { useContext, useEffect } from 'react';

const StyledPlaceholder = styled.div`
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  cursor: pointer;
  outline: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledSubText = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const ImageFieldInput = () => {
  const { draftValue } = useImageField();
  const { onEscape } = useContext(FieldInputEventContext);

  // Placeholder implementation - displays current attachment IDs
  // Full implementation would include file upload, drag-drop, thumbnail grid
  const attachmentCount = draftValue?.attachmentIds?.length || 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.({ newValue: draftValue });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, draftValue]);

  return (
    <FieldInputContainer>
      <StyledPlaceholder tabIndex={0}>
        Image Field ({attachmentCount} images)
        <StyledSubText>Upload functionality coming soon</StyledSubText>
        <StyledSubText>Press Escape or click outside to close</StyledSubText>
      </StyledPlaceholder>
    </FieldInputContainer>
  );
};
