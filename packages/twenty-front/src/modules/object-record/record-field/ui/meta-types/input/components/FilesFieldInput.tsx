import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldDropZone } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldDropZone';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { FilesFieldLabelInput } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldLabelInput';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/filesFieldValueSchema';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useMemo, useRef, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getFileText = (file: FieldFilesValue) => file.label;

const validateFileLabel = (input: string) => ({
  isValid: isNonEmptyString(input.trim()),
  errorMessage: '',
});

const parseFilesArrayToFilesValue = (filesArray: FieldFilesValue[]) => {
  const parseResponse = filesFieldValueSchema.safeParse(filesArray);

  return parseResponse.success ? parseResponse.data : [];
};

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();
  const { uploadFile } = useUploadFilesFieldFile();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueToast } = useToast();
  const setFilePreview = useSetAtomState(filePreviewState);
  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const files = useMemo(
    () => (draftValue ?? []) as FieldFilesValue[],
    [draftValue],
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const handleChange = (updatedFiles: FieldFilesValue[]) => {
    const nextValue = parseFilesArrayToFilesValue(updatedFiles);

    setDraftValue(nextValue);

    // This input renders nothing without files, so close it once the last is gone; persisting is left to onSubmit.
    if (nextValue.length === 0) {
      onEnter?.({ newValue: nextValue, skipPersist: true });
    }
  };

  const handleSubmit = (updatedFiles: FieldFilesValue[]) => {
    if (isDeeplyEqual(files, updatedFiles)) {
      return;
    }

    onSubmit?.({
      newValue: parseFilesArrayToFilesValue(updatedFiles),
      skipClose: true,
    });
  };

  const uploadFiles = async ({
    selectedFiles,
    currentFiles,
  }: {
    selectedFiles: File[];
    currentFiles: FieldFilesValue[];
  }) => {
    if (
      selectedFiles.length > maxNumberOfValues - currentFiles.length &&
      currentFiles.length > 0
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
        fieldDefinition.fieldMetadataId,
        uploadFile,
      );

      if (uploadedFiles.length > 0) {
        const newFiles = [...currentFiles, ...uploadedFiles];
        handleChange(newFiles);
        onEnter?.({ newValue: parseFilesArrayToFilesValue(newFiles) });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFilesBeforeUpload = () => {
    if (isUploading) {
      return null;
    }

    const currentFiles = saveEditedItemInPlace();

    if (isDefined(currentFiles)) {
      closeInput();
    }

    return currentFiles;
  };

  const handleUploadClick = () => {
    const currentFiles = getFilesBeforeUpload();

    if (!isDefined(currentFiles)) {
      return;
    }

    openFileUpload({
      multiple: true,
      onUpload: (selectedFiles: File[]) =>
        uploadFiles({ selectedFiles, currentFiles }),
    });
  };

  const handleDrop = (selectedFiles: File[]) => {
    const currentFiles = getFilesBeforeUpload();

    if (isDefined(currentFiles)) {
      uploadFiles({ selectedFiles, currentFiles });
    }
  };

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const formatFileLabelInputOrThrow = ({
    input,
    itemIndex,
  }: {
    input: string;
    itemIndex?: number;
  }): FieldFilesValue => {
    if (isDefined(itemIndex) && itemIndex >= 0 && itemIndex < files.length) {
      return { ...files[itemIndex], label: input.trim() };
    }

    throw new CustomError(
      doNotTranslate('Cannot create file from text input'),
      'FILES_FIELD_INPUT_CANNOT_CREATE_FILE',
    );
  };

  const isSingleItemMode = maxNumberOfValues === 1;
  const isLimitReached = files.length >= maxNumberOfValues;

  const {
    isInputOpen,
    editedItemIndex,
    inputValue,
    hasError,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: files,
    getItemText: getFileText,
    isInputInitiallyOpen: false,
    validateInput: validateFileLabel,
    onHasErrorChange: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && files.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: files, getItemText: getFileText });

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedFiles = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: files,
      editingIndex: editedItemIndex,
      singleItemMode: isSingleItemMode,
      formatInput: formatFileLabelInputOrThrow,
    });

    handleChange(updatedFiles);

    return updatedFiles;
  };

  const saveEditedItemInPlace = () => {
    if (!isEditingItemInPlace) {
      return files;
    }

    const updatedFiles = saveInputValue();

    if (isDefined(updatedFiles)) {
      handleSubmit(updatedFiles);
    }

    return updatedFiles;
  };

  const handleInputEnter = () => {
    const updatedFiles = saveInputValue();

    if (!isDefined(updatedFiles)) {
      return;
    }

    if (isSingleItemMode) {
      onEnter?.({ newValue: parseFilesArrayToFilesValue(updatedFiles) });
    } else {
      handleSubmit(updatedFiles);
    }

    closeInput();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseFilesArrayToFilesValue(files) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedFiles = isInputOpen ? saveInputValue() : files;

      if (!isDefined(updatedFiles)) {
        return;
      }

      onClickOutside?.({
        newValue: parseFilesArrayToFilesValue(updatedFiles),
        event,
      });
    },
  });

  const handleDelete = (index: number) => {
    const updatedFiles = toSpliced(files, index, 1);

    handleChange(updatedFiles);
    handleSubmit(updatedFiles);
    closeInput();
  };

  const handlePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) return;
    setFilePreview(file);
  };

  if (files.length === 0) {
    return null;
  }

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) && (!isSingleItemMode || !isInputOpen);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
  const editedFile = isDefined(editedItemIndex)
    ? files[editedItemIndex]
    : undefined;

  const fileLabelInput = isDefined(editedFile) && (
    <MultiItemFieldInputRow
      spacing={isEditingItemInPlace ? 'compact' : 'default'}
      hasPadding={shouldShowInputInFooter && shouldShowItems}
      rightComponent={
        <MultiItemFieldSaveButton
          isAddingNewItem={false}
          onClick={handleInputEnter}
        />
      }
    >
      <FilesFieldLabelInput
        file={editedFile}
        value={inputValue}
        hasError={hasError}
        onChange={handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  return (
    <FilesFieldDropZone onDrop={handleDrop}>
      <MultiItemFieldList
        ref={containerRef}
        hasItems={shouldShowItems}
        shouldShowSearch={shouldShowSearch && !isInputOpen}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
        footerInput={shouldShowInputInFooter ? fileLabelInput : undefined}
        addButton={
          !shouldShowInputInFooter && !isLimitReached ? (
            <MultiItemFieldAddButton
              label={isUploading ? t`Uploading...` : t`Upload file`}
              onClick={handleUploadClick}
            />
          ) : undefined
        }
      >
        {visibleItemEntries?.map(({ item: file, index }, position, entries) =>
          index === editedItemIndex && isEditingItemInPlace ? (
            <MultiItemFieldEditedItem
              key={file.fileId}
              hasSeparatorBefore={position > 0}
              hasSeparatorAfter={position < entries.length - 1}
            >
              {fileLabelInput}
            </MultiItemFieldEditedItem>
          ) : (
            <FilesFieldMenuItem
              key={file.fileId}
              dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
              file={file}
              onEdit={() => startEditingItem({ itemIndex: index })}
              onDelete={() => handleDelete(index)}
              onClick={() => handlePreview(file)}
            />
          ),
        )}
      </MultiItemFieldList>
    </FilesFieldDropZone>
  );
};
