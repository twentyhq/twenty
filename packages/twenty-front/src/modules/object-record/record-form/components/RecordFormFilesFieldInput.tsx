import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldDropZone } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldDropZone';
import { FilesFieldLabelInput } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldLabelInput';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Field } from 'twenty-ui/primitives/input';
import { toSpliced } from '~/utils/array/toSpliced';

const getFileText = (file: FieldFilesValue) => file.label;

type RecordFormFilesFieldInputProps = {
  label?: string;
  defaultValue?: FieldFilesValue[];
  fieldMetadataId: string;
  maxNumberOfValues?: number | null;
  onChange: (value: FieldFilesValue[]) => void;
};

export const RecordFormFilesFieldInput = ({
  label,
  defaultValue,
  fieldMetadataId,
  maxNumberOfValues,
  onChange,
}: RecordFormFilesFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const { uploadFile } = useUploadFilesFieldFile();
  const { openFileUpload } = useFileUpload();
  const { enqueueToast } = useToast();

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const [savedFiles, setSavedFiles] = useState(defaultValue ?? []);
  const [isUploading, setIsUploading] = useState(false);

  const {
    editedItemIndex,
    inputValue,
    startEditingItem,
    closeInput,
    handleInputChange,
  } = useMultiItemInput({
    items: savedFiles,
    getItemText: getFileText,
    isInputInitiallyOpen: false,
  });

  const getFilesWithLabel = (fileLabel: string) => {
    const trimmedFileLabel = fileLabel.trim();

    if (!isDefined(editedItemIndex) || !isNonEmptyString(trimmedFileLabel)) {
      return savedFiles;
    }

    return toSpliced(savedFiles, editedItemIndex, 1, {
      ...savedFiles[editedItemIndex],
      label: trimmedFileLabel,
    });
  };

  const saveFiles = (files: FieldFilesValue[]) => {
    setSavedFiles(files);
    onChange(files);
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    onChange(getFilesWithLabel(value));
  };

  const saveInputValue = () => {
    const updatedFiles = getFilesWithLabel(inputValue);

    saveFiles(updatedFiles);
    closeInput();

    return updatedFiles;
  };

  const handleEscape = () => {
    saveFiles(savedFiles);
    closeInput();
  };

  const handleEdit = (index: number) => {
    const updatedFiles = saveInputValue();

    startEditingItem({ itemIndex: index, currentItems: updatedFiles });
  };

  const handleDelete = (index: number) => {
    const updatedFiles = saveInputValue();

    saveFiles(toSpliced(updatedFiles, index, 1));
  };

  const uploadFiles = async ({
    selectedFiles,
    currentFiles,
  }: {
    selectedFiles: File[];
    currentFiles: FieldFilesValue[];
  }) => {
    if (selectedFiles.length > maxItemCount - currentFiles.length) {
      enqueueToast({
        status: 'error',
        children: t`Cannot upload more than ${maxItemCount} files`,
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

      if (isNonEmptyArray(uploadedFiles)) {
        saveFiles([...currentFiles, ...uploadedFiles]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    const currentFiles = saveInputValue();

    if (isUploading) {
      return;
    }

    openFileUpload({
      multiple: true,
      onUpload: (selectedFiles: File[]) =>
        uploadFiles({ selectedFiles, currentFiles }),
    });
  };

  const handleDrop = (selectedFiles: File[]) => {
    if (isUploading) {
      return;
    }

    uploadFiles({ selectedFiles, currentFiles: saveInputValue() });
  };

  const visibleFiles = isNonEmptyArray(savedFiles) ? savedFiles : undefined;

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <FilesFieldDropZone onDrop={handleDrop}>
        <RecordFormMultiItemList
          footer={
            savedFiles.length < maxItemCount ? (
              <MultiItemFieldAddButton
                label={isUploading ? t`Uploading...` : t`Upload file`}
                onClick={handleUploadClick}
              />
            ) : undefined
          }
        >
          {visibleFiles?.map((file, index) =>
            index === editedItemIndex ? (
              <MultiItemFieldEditedItem
                key={file.fileId}
                hasSeparatorBefore={index > 0}
                hasSeparatorAfter={index < savedFiles.length - 1}
              >
                <MultiItemFieldInputRow
                  spacing="compact"
                  rightComponent={
                    <MultiItemFieldSaveButton
                      isAddingNewItem={false}
                      onClick={saveInputValue}
                    />
                  }
                >
                  <FilesFieldLabelInput
                    file={file}
                    value={inputValue}
                    onChange={handleTyping}
                    onEnter={saveInputValue}
                    onEscape={handleEscape}
                  />
                </MultiItemFieldInputRow>
              </MultiItemFieldEditedItem>
            ) : (
              <FilesFieldMenuItem
                key={file.fileId}
                dropdownId={`${instanceId}-file-${index}`}
                file={file}
                onEdit={isUploading ? undefined : () => handleEdit(index)}
                onDelete={isUploading ? undefined : () => handleDelete(index)}
              />
            ),
          )}
        </RecordFormMultiItemList>
      </FilesFieldDropZone>
    </FormFieldInputContainer>
  );
};
