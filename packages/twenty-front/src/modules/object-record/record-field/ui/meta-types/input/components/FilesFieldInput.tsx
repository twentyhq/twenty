import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/filesFieldValueSchema';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
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
    onSubmit?.({
      newValue: parseFilesArrayToFilesValue(updatedFiles),
      skipClose: true,
    });
  };

  const handleUploadClick = () => {
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
            const newFiles = [...files, ...uploadedFiles];
            handleChange(newFiles);
            onEnter?.({ newValue: parseFilesArrayToFilesValue(newFiles) });
          }
        } finally {
          setIsUploading(false);
        }
      },
    });
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

  const draft = useMultiItemDraft({
    items: files,
    onItemsChange: handleChange,
    getItemText: getFileText,
    validateInput: validateFileLabel,
    formatInput: formatFileLabelInputOrThrow,
    maxItemCount: maxNumberOfValues,
    shouldOpenInputWhenEmpty: false,
    onError: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && files.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: files, getItemText: getFileText });

  const handleInputEnter = () => {
    const updatedItems = draft.commitInput();

    if (!isDefined(updatedItems)) {
      return;
    }

    if (draft.isSingleItemMode) {
      onEnter?.({ newValue: parseFilesArrayToFilesValue(updatedItems) });
    } else if (!isDeeplyEqual(files, updatedItems)) {
      handleSubmit(updatedItems);
    }

    draft.closeInput();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseFilesArrayToFilesValue(files) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedItems = draft.isInputDisplayed ? draft.commitInput() : files;

      if (!isDefined(updatedItems)) {
        return;
      }

      onClickOutside?.({
        newValue: parseFilesArrayToFilesValue(updatedItems),
        event,
      });
    },
  });

  const handleDelete = (index: number) => {
    const updatedFiles = toSpliced(files, index, 1);

    handleChange(updatedFiles);
    handleSubmit(updatedFiles);
    draft.resetInputForItems(updatedFiles);
  };

  const handlePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) return;
    setFilePreview(file);
  };

  if (files.length === 0) {
    return null;
  }

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!draft.isSingleItemMode || !draft.isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowUploadButton =
    !draft.isInputDisplayed && !draft.isLimitReached;

  return (
    <OverlayMenuList
      ref={containerRef}
      header={
        shouldShowSearch && !draft.isInputDisplayed ? (
          <MultiItemFieldSearchHeader
            value={searchFilter}
            onChange={setSearchFilter}
          />
        ) : undefined
      }
      footer={
        <>
          {shouldShowItems &&
            (draft.isInputDisplayed || shouldShowUploadButton) && (
              <OverlayMenuListSeparator />
            )}
          {draft.isInputDisplayed && (
            <MultiItemFieldInputRow
              rightComponent={
                <MultiItemFieldSaveButton
                  isAddingNewItem={draft.isAddingNewItem}
                  onClick={handleInputEnter}
                />
              }
            >
              <MultiItemFieldTextInput
                autoFocus={!shouldShowSearch}
                placeholder={t`File label`}
                value={draft.inputValue}
                hasError={draft.hasError}
                onChange={draft.handleInputChange}
                onEnter={handleInputEnter}
                onEscape={handleEscape}
                shouldPreventTabNavigation
              />
            </MultiItemFieldInputRow>
          )}
          {shouldShowUploadButton && (
            <MultiItemFieldAddButton
              label={isUploading ? t`Uploading...` : t`Upload file`}
              onClick={handleUploadClick}
            />
          )}
        </>
      }
    >
      {visibleItemEntries?.map(({ item: file, index }) => (
        <FilesFieldMenuItem
          key={file.fileId}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
          file={file}
          onEdit={() => draft.startEditing(index)}
          onDelete={() => handleDelete(index)}
          onClick={() => handlePreview(file)}
        />
      ))}
    </OverlayMenuList>
  );
};
