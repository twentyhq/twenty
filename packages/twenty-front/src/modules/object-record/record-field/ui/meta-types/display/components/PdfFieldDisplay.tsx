import { FileIcon } from '@/file/components/FileIcon';
import { useAttachmentsByIds } from '@/activities/files/hooks/useAttachmentsByIds';
import { usePdfField } from '@/object-record/record-field/ui/meta-types/hooks/usePdfField';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledPdfContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  flex-wrap: wrap;
`;

const StyledPdfItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  max-width: 150px;
`;

const StyledFileName = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCountBadge = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledLoading = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const PdfFieldDisplay = () => {
  const { fieldValue } = usePdfField();
  const attachmentIds = fieldValue?.attachmentIds || [];
  const { attachments, loading } = useAttachmentsByIds(attachmentIds);

  if (loading) {
    return <StyledLoading><Trans>Loading...</Trans></StyledLoading>;
  }

  if (attachments.length === 0) {
    return <StyledEmptyState><Trans>No PDFs</Trans></StyledEmptyState>;
  }

  // Show first 2 PDF names with count badge
  const visibleAttachments = attachments.slice(0, 2);
  const remainingCount = attachments.length - visibleAttachments.length;

  return (
    <StyledPdfContainer>
      {visibleAttachments.map((attachment) => (
        <StyledPdfItem key={attachment.id} title={attachment.name}>
          <FileIcon fileType={attachment.type} />
          <StyledFileName>
            <OverflowingTextWithTooltip text={attachment.name} />
          </StyledFileName>
        </StyledPdfItem>
      ))}
      {remainingCount > 0 && (
        <StyledCountBadge>+{remainingCount}</StyledCountBadge>
      )}
    </StyledPdfContainer>
  );
};
