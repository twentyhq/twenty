import { useAttachmentsByIds } from '@/activities/files/hooks/useAttachmentsByIds';
import { useImageField } from '@/object-record/record-field/ui/meta-types/hooks/useImageField';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledThumbnailContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
`;

const StyledThumbnail = styled.div<{ thumbnailUrl: string }>`
  width: 24px;
  height: 24px;
  background-image: url(${({ thumbnailUrl }) => thumbnailUrl});
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledCountBadge = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledLoading = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const ImageFieldDisplay = () => {
  const { fieldValue } = useImageField();
  const attachmentIds = fieldValue?.attachmentIds || [];
  const { attachments, loading } = useAttachmentsByIds(attachmentIds);

  if (loading) {
    return <StyledLoading><Trans>Loading...</Trans></StyledLoading>;
  }

  if (attachments.length === 0) {
    return <StyledEmptyState><Trans>No images</Trans></StyledEmptyState>;
  }

  // Show first 3 thumbnails with count badge
  const visibleAttachments = attachments.slice(0, 3);
  const remainingCount = attachments.length - visibleAttachments.length;

  return (
    <StyledThumbnailContainer>
      {visibleAttachments.map((attachment) => (
        <StyledThumbnail
          key={attachment.id}
          thumbnailUrl={attachment.fullPath}
          title={attachment.name}
        />
      ))}
      {remainingCount > 0 && (
        <StyledCountBadge>+{remainingCount}</StyledCountBadge>
      )}
    </StyledThumbnailContainer>
  );
};
