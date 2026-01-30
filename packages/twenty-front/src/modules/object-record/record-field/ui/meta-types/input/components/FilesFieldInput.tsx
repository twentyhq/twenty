import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldFilesValue,
  type FieldFilesValueItem,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesSchema } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { getFileUrl } from '@/object-record/record-field/ui/utils/getFileUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { t as tFunc } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useRecoilValue } from 'recoil';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const StyledFileInput = styled.input`
  display: none;
`;

const StyledModal = styled(Modal)`
  height: calc(100vh - 64px);
  width: calc(100% - ${({ theme }) => theme.spacing(16)});
`;

const StyledModalHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 60px;
  justify-content: space-between;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(0, 4, 0, 4)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  width: 100%;
`;

const StyledModalTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledModalContent = styled.div`
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const PREVIEW_MODAL_ID = 'file-preview-modal';

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();
  const { uploadFile } = useUploadFilesFieldFile();
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [previewedFile, setPreviewedFile] =
    useState<FieldFilesValueItem | null>(null);
  const { openModal, closeModal } = useModal();
  const isAttachmentPreviewEnabled = useRecoilValue(
    isAttachmentPreviewEnabledState,
  );

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const parseFilesArrayToFilesValue = (filesArray: FieldFilesValue) => {
    const parseResponse = filesSchema.safeParse(filesArray);
    if (parseResponse.success) {
      return parseResponse.data;
    }
    return [];
  };

  const files = useMemo(
    () => (draftValue ?? []) as FieldFilesValueItem[],
    [draftValue],
  );

  const handleChange = (updatedFiles: FieldFilesValue) => {
    const nextValue = parseFilesArrayToFilesValue(updatedFiles);
    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: FieldFilesValueItem[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleClickOutside = (
    updatedFiles: FieldFilesValueItem[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({
      newValue: parseFilesArrayToFilesValue(updatedFiles),
      event,
    });
  };

  const handleEscape = (updatedFiles: FieldFilesValueItem[]) => {
    onEscape?.({ newValue: parseFilesArrayToFilesValue(updatedFiles) });
  };

  const handleEnter = (updatedFiles: FieldFilesValueItem[]) => {
    onEnter?.({ newValue: parseFilesArrayToFilesValue(updatedFiles) });
  };

  const handlePreview = (file: FieldFilesValueItem) => {
    if (!isAttachmentPreviewEnabled) return;
    setPreviewedFile(file);
    openModal(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeModal(PREVIEW_MODAL_ID);
    setPreviewedFile(null);
  };

  const handleDownload = () => {
    if (!previewedFile) return;
    const fileUrl = getFileUrl(previewedFile);
    downloadFile(fileUrl, previewedFile.label);
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const handleUploadClick = useCallback(async () => {
    if (isUploading) {
      return;
    }
    fileInputRef.current?.click();
  }, [isUploading]);

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const filesToUpload = event.target.files;
    if (!filesToUpload || filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);

    if (
      isDefined(filesToUpload) &&
      filesToUpload.length > maxNumberOfValues - files.length &&
      files.length > 0
    ) {
      enqueueErrorSnackBar({
        message: t`Cannot upload more than ${maxNumberOfValues} files`,
      });
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const uploadedFiles: FieldFilesValueItem[] = [];

    for (const file of filesToUpload) {
      const uploadedFile = await uploadFile(file);
      if (isDefined(uploadedFile)) {
        uploadedFiles.push(uploadedFile);
      }
    }

    if (isDefined(uploadedFiles) && uploadedFiles.length > 0) {
      const newFiles = [...files, ...uploadedFiles];
      handleChange(newFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsUploading(false);
  };

  const validateInput = useCallback(
    (input: string) => ({
      isValid: input.trim().length > 0,
      errorMessage: '',
    }),
    [],
  );

  const formatInput = useCallback(
    (_input: string, index?: number): FieldFilesValueItem => {
      if (
        index !== undefined &&
        index >= 0 &&
        index < files.length &&
        isDefined(files)
      ) {
        const fileToEdit = files[index];
        return {
          ...fileToEdit,
          label: _input.trim(),
        };
      }
      throw new Error('Cannot create file from text input');
    },
    [files],
  );

  return (
    <>
      <StyledFileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
      />
      <MultiItemFieldInput
        items={files}
        onChange={handleChange}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onClickOutside={handleClickOutside}
        placeholder={t`File label`}
        fieldMetadataType={FieldMetadataType.FILES}
        validateInput={validateInput}
        formatInput={formatInput}
        renderItem={({ value: file, index, handleEdit, handleDelete }) => (
          <FilesFieldMenuItem
            key={file.fileId}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            file={file}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={() => handlePreview(file)}
          />
        )}
        newItemLabel={isUploading ? t`Uploading...` : t`Upload file`}
        onAddClick={handleUploadClick}
        onError={handleError}
        maxItemCount={maxNumberOfValues}
      />
      {previewedFile &&
        isAttachmentPreviewEnabled &&
        createPortal(
          <StyledModal
            modalId={PREVIEW_MODAL_ID}
            size="large"
            isClosable
            onClose={handleClosePreview}
            ignoreContainer
          >
            <StyledModalHeader>
              <StyledHeader>
                <StyledModalTitle>{previewedFile.label}</StyledModalTitle>
                <StyledButtonContainer>
                  <IconButton
                    Icon={IconDownload}
                    onClick={handleDownload}
                    size="small"
                  />
                  <IconButton
                    Icon={IconX}
                    onClick={handleClosePreview}
                    size="small"
                  />
                </StyledButtonContainer>
              </StyledHeader>
            </StyledModalHeader>
            <ScrollWrapper
              componentInstanceId={`preview-modal-${previewedFile.fileId}`}
            >
              <StyledModalContent>
                <Suspense
                  fallback={
                    <StyledLoadingContainer>
                      <StyledLoadingText>
                        {tFunc({ message: 'Loading document viewer...' })}
                      </StyledLoadingText>
                    </StyledLoadingContainer>
                  }
                >
                  <DocumentViewer
                    documentName={previewedFile.label}
                    documentUrl={getFileUrl(previewedFile)}
                  />
                </Suspense>
              </StyledModalContent>
            </ScrollWrapper>
          </StyledModal>,
          document.body,
        )}
    </>
  );
};
