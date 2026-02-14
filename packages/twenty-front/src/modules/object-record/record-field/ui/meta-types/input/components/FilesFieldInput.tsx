import { isAttachmentPreviewEnabledStateV2 } from '@/client-config/states/isAttachmentPreviewEnabledStateV2';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesSchema } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { filePreviewStateV2 } from '@/ui/field/display/states/filePreviewStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useMemo, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();
  const { uploadFile } = useUploadFilesFieldFile();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const setFilePreview = useSetRecoilStateV2(filePreviewStateV2);
  const isAttachmentPreviewEnabled = useRecoilValueV2(
    isAttachmentPreviewEnabledStateV2,
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

        if (nextValue.length === 0) {
          onEnter?.({ newValue: nextValue });
        }
      }
    },
    [parseFilesArrayToFilesValue, setDraftValue, onEnter],
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

        try {
          const uploadedFiles = await uploadMultipleFiles(
            selectedFiles,
            fieldDefinition.fieldMetadataId,
            uploadFile,
          );

          if (uploadedFiles.length > 0) {
            const newFiles = [...files, ...uploadedFiles];
            handleChange(newFiles);
            onEnter?.({ newValue: parseFilesArrayToFilesValue(newFiles) });
          }
        } finally {
          setIsUploading(false);
        }
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
    fieldDefinition,
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
    setFilePreview(file);
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

  if (files.length === 0) {
    return null;
  }

  return (
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
  );
};
