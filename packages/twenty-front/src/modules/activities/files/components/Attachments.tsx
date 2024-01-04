import { ChangeEvent, useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Attachment } from '@/activities/files/types/Attachment';
import { getFileType } from '@/activities/files/utils/getFileType';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { FileFolder, useUploadFileMutation } from '~/generated/graphql';

const StyledTaskGroupEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(16)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
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

export const Attachments = ({
  targetableEntity,
}: {
  targetableEntity: ActivityTargetableEntity;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { attachments } = useAttachments(targetableEntity);

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
    const result = await uploadFile({
      variables: {
        file,
        fileFolder: FileFolder.Attachment,
      },
    });

    const attachmentUrl = result?.data?.uploadFile;

    if (!attachmentUrl) {
      return;
    }
    if (!createOneAttachment) {
      return;
    }

    await createOneAttachment({
      authorId: currentWorkspaceMember?.id,
      name: file.name,
      fullPath: attachmentUrl,
      type: getFileType(file.name),
      companyId:
        targetableEntity.type === 'Company' ? targetableEntity.id : null,
      personId: targetableEntity.type === 'Person' ? targetableEntity.id : null,
    });
  };

  if (attachments?.length === 0 && targetableEntity.type !== 'Custom') {
    return (
      <StyledTaskGroupEmptyContainer>
        <StyledFileInput
          ref={inputFileRef}
          onChange={handleFileChange}
          type="file"
        />

        <StyledEmptyTaskGroupTitle>No files yet</StyledEmptyTaskGroupTitle>
        <StyledEmptyTaskGroupSubTitle>Upload one:</StyledEmptyTaskGroupSubTitle>
        <Button
          Icon={IconPlus}
          title="Add file"
          variant="secondary"
          onClick={handleUploadFileClick}
        />
      </StyledTaskGroupEmptyContainer>
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
