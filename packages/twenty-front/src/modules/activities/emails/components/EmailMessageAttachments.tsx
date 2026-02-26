import styled from '@emotion/styled';

import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { type EmailThreadMessageAttachment } from '@/activities/emails/types/EmailThreadMessage';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { FileIcon } from '@/file/components/FileIcon';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(0, 6)};
  width: calc(100% - ${({ theme }) => theme.spacing(12)});
`;

const StyledTitleBar = styled.h3`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  overflow: auto;
  flex: 1;
`;

const StyledLinkContainer = styled.div`
  overflow: auto;
  width: 100%;
`;

const StyledLink = styled.a`
  align-items: center;
  appearance: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  text-align: left;
  text-decoration: none;
  width: 100%;

  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type EmailMessageAttachmentsProps = {
  attachments: EmailThreadMessageAttachment[];
};

export const EmailMessageAttachments = ({
  attachments,
}: EmailMessageAttachmentsProps) => {
  const { t } = useLingui();
  if (attachments.length === 0) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledTitleBar>
        <StyledTitle>
          {t`Attachments`} <StyledCount>({attachments.length})</StyledCount>
        </StyledTitle>
      </StyledTitleBar>
      <ActivityList>
        {attachments.map((attachment) => {
          const { extension } = getFileNameAndExtension(attachment.name);
          const fileCategory = getFileCategoryFromExtension(
            extension.replace('.', ''),
          );
          const downloadUrl = `${window.location.origin}/api/message-attachments/${attachment.id}/download`;

          return (
            <ActivityRow
              key={attachment.id}
              onClick={() => downloadFile(downloadUrl, attachment.name)}
            >
              <StyledLeftContent>
                <FileIcon fileCategory={fileCategory} />
                <StyledLinkContainer>
                  <StyledLink
                    href={downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      downloadFile(downloadUrl, attachment.name);
                    }}
                  >
                    <OverflowingTextWithTooltip text={attachment.name} />
                  </StyledLink>
                </StyledLinkContainer>
              </StyledLeftContent>
            </ActivityRow>
          );
        })}
      </ActivityList>
    </StyledContainer>
  );
};
