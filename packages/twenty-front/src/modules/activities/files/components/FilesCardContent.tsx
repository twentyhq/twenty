import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ChangeEvent, type RefObject, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

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

type FilesCardContentProps = {
  attachments: Attachment[];
  canUploadFiles: boolean;
  inputFileRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  onUploadFiles: (files: File[]) => Promise<void>;
  targetRecord: ActivityTargetableObject;
};

export const FilesCardContent = ({
  attachments,
  canUploadFiles,
  inputFileRef,
  loading,
  onUploadFiles,
  targetRecord,
}: FilesCardContentProps) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { t } = useLingui();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(event.target.files)) {
      onUploadFiles(Array.from(event.target.files));
    }
  };

  const isAttachmentsEmpty = attachments.length === 0;

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
          <AnimatedPlaceholderEmptyContainer>
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
                onClick={() => inputFileRef.current?.click()}
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
        attachments={attachments ?? []}
      />
    </StyledAttachmentsContainer>
  );
};
