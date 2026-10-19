import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldLabelInput } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldLabelInput';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/filesFieldValueSchema';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useToast } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledFilesDropZone = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  width: 100%;

  &[data-drag-active='true'] {
    outline: 1px dashed ${themeCssVariables.border.color.blue};
    outline-offset: -1px;
  }
`;

type FilesMultiItemInputProps = {
  value: FieldFilesValue[] | null | undefined;
  fieldName: string;
  fieldMetadataId: string;
  maxNumberOfValues?: number | null;
  variant?: FieldInputVariant;
  onChange: (value: FieldFilesValue[]) => void;
  onFilesUploaded?: (value: FieldFilesValue[]) => void;
  onEnter?: (value: FieldFilesValue[]) => void;
  onEscape?: (value: FieldFilesValue[]) => void;
  onSubmit?: (value: FieldFilesValue[]) => void;
  onClickOutside?: (
    value: FieldFilesValue[],
    event: MouseEvent | TouchEvent,
  ) => void;
  onError?: (hasError: boolean, values: FieldFilesValue[]) => void;
};

export const FilesMultiItemInput = ({
  value,
  fieldName,
  fieldMetadataId,
  maxNumberOfValues: maxNumberOfValuesSetting,
  variant,
  onChange,
  onFilesUploaded,
  onEnter,
  onEscape,
  onSubmit,
  onClickOutside,
  onError,
}: FilesMultiItemInputProps) => {
  const maxNumberOfValues =
    maxNumberOfValuesSetting ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const { uploadFile } = useUploadFilesFieldFile();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();
  const [isUploading, setIsUploading] = useState(false);
  const [inlineUploadCount, setInlineUploadCount] = useState(0);
  const [editedFileIndex, setEditedFileIndex] = useState<number | null>(null);
  const { enqueueToast } = useToast();
  const setFilePreview = useSetAtomState(filePreviewState);
  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const parseFilesArrayToFilesValue = useCallback(
    (filesArray: FieldFilesValue[]) => {
      const parseResponse = filesFieldValueSchema.safeParse(filesArray);
      if (parseResponse.success) {
        return parseResponse.data;
      }
      return [];
    },
    [],
  );

  const files = useMemo(() => value ?? [], [value]);

  const handleChange = useCallback(
    (updatedFiles: FieldFilesValue[]) => {
      onChange(parseFilesArrayToFilesValue(updatedFiles));
    },
    [onChange, parseFilesArrayToFilesValue],
  );

  const uploadFiles = async (selectedFiles: File[]) => {
    if (
      selectedFiles.length > maxNumberOfValues - files.length &&
      files.length > 0
    ) {
      enqueueToast({
        status: 'error',
        children: t`Cannot upload more than ${maxNumberOfValues} files`,
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadedFiles = await uploadMultipleFiles(
        selectedFiles,
        fieldMetadataId,
        uploadFile,
      );

      if (uploadedFiles.length > 0) {
        const newFiles = [...files, ...uploadedFiles];
        handleChange(newFiles);
        onFilesUploaded?.(parseFilesArrayToFilesValue(newFiles));

        if (variant === 'inline') {
          setInlineUploadCount((count) => count + 1);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (isUploading) {
      return;
    }

    openFileUpload({ multiple: true, onUpload: uploadFiles });
  };

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    disabled: isUploading,
    onDropAccepted: uploadFiles,
  });

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
    (input: string, index?: number): FieldFilesValue => {
      if (isDefined(index) && index >= 0 && index < files.length) {
        return {
          ...files[index],
          label: input.trim(),
        };
      }
      throw new Error(doNotTranslate('Cannot create file from text input'));
    },
    [files],
  );

  const editedFile = isDefined(editedFileIndex)
    ? files[editedFileIndex]
    : undefined;

  return (
    <StyledFilesDropZone
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
      data-drag-active={isDragActive}
    >
      <MultiItemFieldInput
        key={inlineUploadCount}
        variant={variant}
        items={files}
        onChange={handleChange}
        onEnter={(updatedFiles) =>
          onEnter?.(parseFilesArrayToFilesValue(updatedFiles))
        }
        onSubmit={(updatedFiles) =>
          onSubmit?.(parseFilesArrayToFilesValue(updatedFiles))
        }
        onEscape={(updatedFiles) =>
          onEscape?.(parseFilesArrayToFilesValue(updatedFiles))
        }
        onClickOutside={(updatedFiles, event) =>
          onClickOutside?.(parseFilesArrayToFilesValue(updatedFiles), event)
        }
        placeholder={t`File label`}
        fieldMetadataType={FieldMetadataType.FILES}
        validateInput={validateInput}
        formatInput={formatInput}
        renderItem={({ value: file, index, handleEdit, handleDelete }) => (
          <FilesFieldMenuItem
            key={file.fileId}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldName}-${index}`}
            file={file}
            onEdit={() => {
              setEditedFileIndex(index);
              handleEdit();
            }}
            onDelete={handleDelete}
            onClick={() => handlePreview(file)}
          />
        )}
        renderInput={({
          value: label,
          onChange: onLabelChange,
          onKeyDown,
          onFocus,
          onBlur,
          autoFocus,
          placeholder,
          isFramed,
        }) => (
          <FilesFieldLabelInput
            file={editedFile}
            value={label}
            onChange={onLabelChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus={autoFocus}
            placeholder={placeholder}
            isFramed={isFramed}
          />
        )}
        newItemLabel={isUploading ? t`Uploading...` : t`Upload file`}
        onAddClick={handleUploadClick}
        onError={onError}
        maxItemCount={maxNumberOfValues}
      />
    </StyledFilesDropZone>
  );
};
