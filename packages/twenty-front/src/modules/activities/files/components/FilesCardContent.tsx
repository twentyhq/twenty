import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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

const StyledDropZoneContainer = styled.div`
  height: 100%;
`;

type FilesCardContentProps = {
  attachments: Attachment[];
  canUploadFiles: boolean;
  loading: boolean;
  onAddFile: () => void;
  onUploadFiles: (files: File[]) => Promise<void>;
  targetRecord: ActivityTargetableObject;
};

export const FilesCardContent = ({
  attachments,
  canUploadFiles,
  loading,
  onAddFile,
  onUploadFiles,
  targetRecord,
}: FilesCardContentProps) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { t } = useLingui();

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
            {canUploadFiles && (
              <Button
                Icon={IconPlus}
                title={t`Add file`}
                variant="secondary"
                onClick={onAddFile}
              />
            )}
          </AnimatedPlaceholderEmptyContainer>
        )}
      </StyledDropZoneContainer>
    );
  }

  return (
    <StyledAttachmentsContainer>
      <AttachmentList
        targetableObject={targetRecord}
        attachments={attachments}
      />
    </StyledAttachmentsContainer>
  );
};
