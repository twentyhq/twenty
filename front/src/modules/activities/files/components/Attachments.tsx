import { ChangeEvent, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Attachment } from '@/activities/files/types/Attachment';
import { getFileType } from '@/activities/files/utils/getFileType';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useFindOneObjectRecord } from '@/object-record/hooks/useFindOneObjectRecord';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';
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
  entity,
}: {
  entity: ActivityTargetableEntity;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { attachments } = useAttachments(entity);
  const { objectNameSingular, objectMetadataId } = useParams<{
    objectNameSingular: string;
    objectMetadataId: string;
  }>();

  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(objectMetadataId ?? ''),
  );

  const { object } = useFindOneObjectRecord({
    objectRecordId: objectMetadataId,
    objectNameSingular,
    onCompleted: (data) => {
      setEntityFields(data);
    },
  });

  const [uploadFile] = useUploadFileMutation();

  const { createOneObject: createOneAttachment } =
    useCreateOneObjectRecord<Attachment>({
      objectNameSingular: 'attachment',
    });

  if (!object) {
    return;
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      companyId: entity.type == 'Company' ? entity.id : null,
      personId: entity.type == 'Person' ? entity.id : null,
    });
  };

  if (attachments?.length === 0 && entity.type !== 'Custom') {
    return (
      <StyledTaskGroupEmptyContainer>
        <StyledFileInput
          ref={inputFileRef}
          onChange={onFileChange}
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
      <StyledFileInput ref={inputFileRef} onChange={onFileChange} type="file" />
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
