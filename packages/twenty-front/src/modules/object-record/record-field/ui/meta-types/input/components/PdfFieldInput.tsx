import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePdfField } from '@/object-record/record-field/ui/meta-types/hooks/usePdfField';
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

export const PdfFieldInput = () => {
  const { draftValue } = usePdfField();
  const { onEscape } = useContext(FieldInputEventContext);

  // Placeholder implementation - displays current attachment IDs
  // Full implementation would include file upload, drag-drop, and file management
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
        PDF Field ({attachmentCount} files)
        <StyledSubText>Upload functionality coming soon</StyledSubText>
        <StyledSubText>Press Escape or click outside to close</StyledSubText>
      </StyledPlaceholder>
    </FieldInputContainer>
  );
};
