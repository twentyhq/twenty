import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Attachment } from '@/activities/files/types/Attachment';
import { uploadAttachFile } from '@/activities/files/utils/uploadFile';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { useUploadFileMutation } from '~/generated/graphql';

const StyledTaskGroupEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  height: 100%;
`;

const StyledEmptyTaskGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTaskGroupSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
  padding: 24px;
`;

export const Attachments = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { attachments } = useAttachments(targetableObject);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadFile] = useUploadFileMutation();

  const { createOneRecord: createOneAttachment } =
    useCreateOneRecord<Attachment>({
      objectNameSingular: CoreObjectNameSingular.Attachment,
    });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onUploadFile?.(e.target.files[0]);
  };

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const onUploadFile = async (file: File) => {
    await uploadAttachFile(
      file,
      targetableObject,
      currentWorkspaceMember?.id,
      createOneAttachment,
      uploadFile,
    );
  };

  if (!isNonEmptyArray(attachments)) {
    return (
      <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
        {isDraggingFile ? (
          <DropZone
            setIsDraggingFile={setIsDraggingFile}
            onUploadFile={onUploadFile}
          />
        ) : (
          <StyledTaskGroupEmptyContainer>
            <StyledFileInput
              ref={inputFileRef}
              onChange={handleFileChange}
              type="file"
            />
            <StyledEmptyTaskGroupTitle>No files yet</StyledEmptyTaskGroupTitle>
            <StyledEmptyTaskGroupSubTitle>
              Upload one:
            </StyledEmptyTaskGroupSubTitle>
            <Button
              Icon={IconPlus}
              title="Add file"
              variant="secondary"
              onClick={handleUploadFileClick}
            />
          </StyledTaskGroupEmptyContainer>
        )}
      </StyledDropZoneContainer>
    );
  }

  return (
    <StyledAttachmentsContainer>
      <StyledFileInput
        ref={inputFileRef}
        onChange={handleFileChange}
        type="file"
      />
      <AttachmentList
        targetableObject={targetableObject}
        title="All"
        attachments={attachments ?? []}
        button={
          <Button
            Icon={IconPlus}
            size="small"
            variant="secondary"
            title="Add file"
            onClick={handleUploadFileClick}
          ></Button>
        }
      />
    </StyledAttachmentsContainer>
  );
};
