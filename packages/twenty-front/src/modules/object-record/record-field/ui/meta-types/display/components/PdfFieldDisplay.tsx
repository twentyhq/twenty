import { usePdfField } from '@/object-record/record-field/ui/meta-types/hooks/usePdfField';
import styled from '@emotion/styled';

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDisplay = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const PdfFieldDisplay = () => {
  const { fieldValue } = usePdfField();

  // Placeholder implementation - displays attachment count
  // Full implementation would show file list with download/preview links
  const attachmentCount = fieldValue?.attachmentIds?.length || 0;

  if (attachmentCount === 0) {
    return <StyledEmptyState>No PDFs</StyledEmptyState>;
  }

  return (
    <StyledDisplay>
      {attachmentCount} PDF{attachmentCount !== 1 ? 's' : ''}
    </StyledDisplay>
  );
};
