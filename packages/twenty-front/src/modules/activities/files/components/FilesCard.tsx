import styled from '@emotion/styled';
import { type ChangeEvent, useRef, useState } from 'react';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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
`;

export const FilesCard = () => {
  const targetRecord = useTargetRecord();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { attachments, loading } = useAttachments(targetRecord);
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const { t } = useLingui();

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetRecord);
  };

  const onUploadFiles = async (files: File[]) => {
    for (const file of files) {
      await onUploadFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      onUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const isAttachmentsEmpty = !attachments || attachments.length === 0;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const canUploadFiles = hasObjectUpdatePermissions && hasUploadPermission;

  if (loading && isAttachmentsEmpty) {
    return <SkeletonLoader />;
  }

  if (isAttachmentsEmpty) {
    return (
      <StyledDropZoneContainer
        onDragEnter={() => canUploadFiles && setIsDraggingFile(true)}
      >
        {isDraggingFile && canUploadFiles ? (
          <DropZone
            setIsDraggingFile={setIsDraggingFile}
            onUploadFiles={onUploadFiles}
          />
        ) : (
          <AnimatedPlaceholderEmptyContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
          >
            <AnimatedPlaceholder type="noFile" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                <Trans>No Files</Trans>
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                <Trans>There are no associated files with this record.</Trans>
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
            <StyledFileInput
              ref={inputFileRef}
              onChange={handleFileChange}
              type="file"
              multiple
            />
            {canUploadFiles && (
              <Button
                Icon={IconPlus}
                title={t`Add file`}
                variant="secondary"
                onClick={handleUploadFileClick}
              />
            )}
          </AnimatedPlaceholderEmptyContainer>
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
        multiple
      />
      <AttachmentList
        targetableObject={targetRecord}
        title={t`All`}
        attachments={attachments ?? []}
        button={
          canUploadFiles && (
            <Button
              Icon={IconPlus}
              size="small"
              variant="secondary"
              title={t`Add file`}
              onClick={handleUploadFileClick}
            ></Button>
          )
        }
      />
    </StyledAttachmentsContainer>
  );
};
