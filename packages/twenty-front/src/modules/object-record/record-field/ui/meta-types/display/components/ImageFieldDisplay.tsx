import { useImageField } from '@/object-record/record-field/ui/meta-types/hooks/useImageField';
import styled from '@emotion/styled';

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDisplay = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const ImageFieldDisplay = () => {
  const { fieldValue } = useImageField();

  // Placeholder implementation - displays attachment count
  // Full implementation would show thumbnail grid with lightbox
  const attachmentCount = fieldValue?.attachmentIds?.length || 0;

  if (attachmentCount === 0) {
    return <StyledEmptyState>No images</StyledEmptyState>;
  }

  return (
    <StyledDisplay>
      {attachmentCount} image{attachmentCount !== 1 ? 's' : ''}
    </StyledDisplay>
  );
};
