import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { Attachment } from '@/activities/files/types/Attachment';

import { AttachmentRow } from './AttachmentRow';

type AttachmentListProps = {
  title: string;
  attachments: Attachment[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledAttachmentContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 100%;
`;

export const AttachmentList = ({
  title,
  attachments,
  button,
}: AttachmentListProps) => (
  <>
    {attachments && attachments.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          <StyledTitle>
            {title} <StyledCount>{attachments.length}</StyledCount>
          </StyledTitle>
          {button}
        </StyledTitleBar>
        <StyledAttachmentContainer>
          {attachments.map((attachment) => (
            <AttachmentRow key={attachment.id} attachment={attachment} />
          ))}
        </StyledAttachmentContainer>
      </StyledContainer>
    )}
  </>
);
