import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesSchema } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FilePreviewModal } from '@/ui/field/display/components/FilePreviewModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const PREVIEW_MODAL_ID = 'file-preview-modal';

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();
  const { uploadFile } = useUploadFilesFieldFile();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [previewedFile, setPreviewedFile] = useState<FieldFilesValue | null>(
    null,
  );
  const { openModal, closeModal } = useModal();
  const isAttachmentPreviewEnabled = useRecoilValue(
    isAttachmentPreviewEnabledState,
  );

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const parseFilesArrayToFilesValue = useCallback(
    (filesArray: FieldFilesValue[]) => {
      const parseResponse = filesSchema.safeParse(filesArray);
      if (parseResponse.success) {
        return parseResponse.data;
      }
      return [];
    },
    [],
  );

  const files = useMemo(
    () => (draftValue ?? []) as FieldFilesValue[],
    [draftValue],
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const handleChange = useCallback(
    (updatedFiles: FieldFilesValue[]) => {
      const nextValue = parseFilesArrayToFilesValue(updatedFiles);
      if (isDefined(nextValue)) {
        setDraftValue(nextValue);
      }
    },
    [parseFilesArrayToFilesValue, setDraftValue],
  );

  const handleUploadClick = useCallback(() => {
    if (isUploading) {
      return;
    }

    openFileUpload({
      multiple: true,
      onUpload: async (selectedFiles: File[]) => {
        if (
          selectedFiles.length > maxNumberOfValues - files.length &&
          files.length > 0
        ) {
          enqueueErrorSnackBar({
            message: t`Cannot upload more than ${maxNumberOfValues} files`,
          });
          return;
        }

        setIsUploading(true);

        const uploadedFiles: FieldFilesValue[] = [];

        for (const file of selectedFiles) {
          const uploadedFile = await uploadFile(file);
          if (isDefined(uploadedFile)) {
            uploadedFiles.push(uploadedFile);
          }
        }

        if (uploadedFiles.length > 0) {
          const newFiles = [...files, ...uploadedFiles];
          handleChange(newFiles);
          onEnter?.({ newValue: parseFilesArrayToFilesValue(newFiles) });
        }

        setIsUploading(false);
      },
    });
  }, [
    isUploading,
    openFileUpload,
    files,
    maxNumberOfValues,
    enqueueErrorSnackBar,
    t,
    uploadFile,
    handleChange,
    onEnter,
    parseFilesArrayToFilesValue,
  ]);

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: FieldFilesValue[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleClickOutside = (
    updatedFiles: FieldFilesValue[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({
      newValue: parseFilesArrayToFilesValue(updatedFiles),
      event,
    });
  };

  const handleEscape = (updatedFiles: FieldFilesValue[]) => {
    onEscape?.({ newValue: parseFilesArrayToFilesValue(updatedFiles) });
  };

  const handleEnter = (updatedFiles: FieldFilesValue[]) => {
    onEnter?.({ newValue: parseFilesArrayToFilesValue(updatedFiles) });
  };

  const handlePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) return;
    setPreviewedFile(file);
    openModal(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeModal(PREVIEW_MODAL_ID);
    setPreviewedFile(null);
  };

  const validateInput = useCallback(
    (input: string) => ({
      isValid: input.trim().length > 0,
      errorMessage: '',
    }),
    [],
  );

  const formatInput = useCallback(
    (_input: string, index?: number): FieldFilesValue => {
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
      {files.length > 0 && (
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
      )}
      {isAttachmentPreviewEnabled && (
        <FilePreviewModal
          file={previewedFile}
          modalId={PREVIEW_MODAL_ID}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};
