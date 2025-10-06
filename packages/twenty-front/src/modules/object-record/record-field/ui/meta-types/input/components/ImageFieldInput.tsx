import { AttachmentGrid } from '@/activities/files/components/AttachmentGrid';
import { AttachmentSelector } from '@/activities/files/components/AttachmentSelector';
import { useAttachmentsByIds } from '@/activities/files/hooks/useAttachmentsByIds';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { useImageField } from '@/object-record/record-field/ui/meta-types/hooks/useImageField';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconUpload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  min-width: 300px;
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

const MODAL_ID = 'image-field-attachment-selector';

export const ImageFieldInput = () => {
  const { t } = useLingui();
  const { recordId, objectMetadataNameSingular, fieldDefinition, draftValue, setDraftValue, setFieldValue } = useImageField();
  const { onEscape, onSubmit } = useContext(FieldInputEventContext);
  const { persistFieldFromFieldInputContext } = usePersistFieldFromFieldInputContext();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { openModal, closeModal } = useModal();
  const [isUploading, setIsUploading] = useState(false);

  const attachmentIds = draftValue?.attachmentIds || [];
  const { attachments, loading } = useAttachmentsByIds(attachmentIds);

  // Check if we have valid object metadata to enable "Link Existing"
  const canLinkExisting =
    objectMetadataNameSingular && objectMetadataNameSingular.trim() !== '';

  const targetableObject: ActivityTargetableObject = {
    id: recordId,
    targetObjectNameSingular: objectMetadataNameSingular || '',
  };

  const isImageAttachment = (name: string, type: string) => {
    if (type === 'Image') return true;
    const ext = name.split('.').at(-1)?.toLowerCase();
    return !!ext && IMAGE_EXTENSIONS.includes(ext);
  };

  const handleUploadClick = () => {
    inputFileRef?.current?.click?.();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!isDefined(e.target.files) || e.target.files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const uploadedIds: string[] = [];

      for (const file of Array.from(e.target.files)) {
        const result = await uploadAttachmentFile(file, targetableObject);
        if (result?.attachmentId) {
          uploadedIds.push(result.attachmentId);
        }
      }

      const newAttachmentIds = [...attachmentIds, ...uploadedIds];
      const newValue = { attachmentIds: newAttachmentIds };
      setDraftValue(newValue);
      // Persist to database immediately after upload (before setFieldValue to avoid race condition)
      persistFieldFromFieldInputContext(newValue);
      // setFieldValue will be called by the persistence layer
      onSubmit?.({ newValue });
    } finally {
      setIsUploading(false);
      // Reset input to allow uploading the same file again
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  };

  const [pendingSelection, setPendingSelection] = useState<string[]>(attachmentIds);

  // Keep pendingSelection in sync with attachmentIds (when uploading/removing outside the modal)
  useEffect(() => {
    setPendingSelection(attachmentIds);
  }, [attachmentIds]);

  const handleLinkExisting = () => {
    openModal(MODAL_ID);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setPendingSelection(selectedIds);
    setDraftValue({ attachmentIds: selectedIds });
  };

  const handleModalClose = () => {
    closeModal(MODAL_ID);
    // Persist the selection to database using the tracked pending selection
    const newValue = { attachmentIds: pendingSelection };
    persistFieldFromFieldInputContext(newValue);
    onSubmit?.({ newValue });
  };

  const handleRemove = (attachmentId: string) => {
    const newAttachmentIds = attachmentIds.filter((id: string) => id !== attachmentId);
    const newValue = { attachmentIds: newAttachmentIds };
    setDraftValue(newValue);
    // Persist to database immediately after removal
    persistFieldFromFieldInputContext(newValue);
    onSubmit?.({ newValue });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.({ newValue: draftValue });
      } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        onSubmit?.({ newValue: draftValue });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onSubmit, draftValue]);

  return (
    <>
      <FieldInputContainer>
        <StyledContainer>
          <StyledButtonRow>
            <Button
              Icon={IconUpload}
              title={isUploading ? t`Uploading...` : t`Upload Images`}
              variant="secondary"
              onClick={handleUploadClick}
              disabled={isUploading}
              size="small"
            />
            <Button
              Icon={IconLink}
              title={t`Link Existing`}
              variant="secondary"
              onClick={handleLinkExisting}
              disabled={!canLinkExisting}
              size="small"
            />
          </StyledButtonRow>

          <StyledFileInput
            ref={inputFileRef}
            onChange={handleFileChange}
            type="file"
            accept={IMAGE_EXTENSIONS.map((e) => `.${e}`).join(',')}
            multiple
          />

          {loading && <div><Trans>Loading...</Trans></div>}

          {!loading && attachments.length === 0 && (
            <StyledEmptyState>
              <Trans>No images linked</Trans>
            </StyledEmptyState>
          )}

          {!loading && attachments.length > 0 && (
            <AttachmentGrid
              attachments={attachments}
              onRemove={handleRemove}
            />
          )}
        </StyledContainer>
      </FieldInputContainer>

      <Modal
        modalId={MODAL_ID}
        isClosable={true}
        onClose={handleModalClose}
        size="large"
        padding="none"
      >
        <AttachmentSelector
          targetableObject={targetableObject}
          selectedIds={pendingSelection}
          onSelectionChange={handleSelectionChange}
          onClose={handleModalClose}
          filterAttachment={(a) => isImageAttachment(a.name, a.type)}
          title={t`Select Images`}
        />
      </Modal>
    </>
  );
};
