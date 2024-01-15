import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { DropZone } from '@/activities/files/components/DropZone';
import { Attachment } from '@/activities/files/types/Attachment';
import { uploadAttachFile } from '@/activities/files/utils/uploadFile';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUploadFileMutation } from '~/generated/graphql';

import { AttachmentRow } from './AttachmentRow';

type AttachmentListProps = {
  targetableObject: ActivityTargetableObject;
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
  padding: 8px 24px 24px;
  height: 100%;
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

const StyledDropZoneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const AttachmentList = ({
  targetableObject,
  title,
  attachments,
  button,
}: AttachmentListProps) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [uploadFile] = useUploadFileMutation();

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: CoreObjectNameSingular.Attachment,
    });

  const onUploadFile = async (file: File) => {
    await uploadAttachFile(
      file,
      targetableObject,
      currentWorkspaceMember?.id,
      createOneAttachment,
      uploadFile,
    );
  };

  return (
    <>
      {attachments && attachments.length > 0 && (
        <StyledContainer>
          <StyledTitleBar>
            <StyledTitle>
              {title} <StyledCount>{attachments.length}</StyledCount>
            </StyledTitle>
            {button}
          </StyledTitleBar>
          <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
            {isDraggingFile ? (
              <DropZone
                setIsDraggingFile={setIsDraggingFile}
                onUploadFile={onUploadFile}
              />
            ) : (
              <StyledAttachmentContainer>
                {attachments.map((attachment) => (
                  <AttachmentRow key={attachment.id} attachment={attachment} />
                ))}
              </StyledAttachmentContainer>
            )}
          </StyledDropZoneContainer>
        </StyledContainer>
      )}
    </>
  );
};
