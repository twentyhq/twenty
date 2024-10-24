import styled from '@emotion/styled';
import { ChangeEvent, useRef, useState } from 'react';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Button,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  IconPlus,
} from 'twenty-ui';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isDefined } from '~/utils/isDefined';

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

export const Attachments = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { attachments, loading } = useAttachments(targetableObject);
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) onUploadFile?.(e.target.files[0]);
  };

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetableObject);
  };

  const isAttachmentsEmpty = !attachments || attachments.length === 0;

  if (loading && isAttachmentsEmpty) {
    return <SkeletonLoader />;
  }

  if (isAttachmentsEmpty) {
    return (
      <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
        {isDraggingFile ? (
          <DropZone
            setIsDraggingFile={setIsDraggingFile}
            onUploadFile={onUploadFile}
          />
        ) : (
          <AnimatedPlaceholderEmptyContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
          >
            <AnimatedPlaceholder type="noFile" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                No Files
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                There are no associated files with this record.
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
            <StyledFileInput
              ref={inputFileRef}
              onChange={handleFileChange}
              type="file"
            />
            <Button
              Icon={IconPlus}
              title="Add file"
              variant="secondary"
              onClick={handleUploadFileClick}
            />
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
