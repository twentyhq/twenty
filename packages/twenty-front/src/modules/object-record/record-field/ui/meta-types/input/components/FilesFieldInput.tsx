import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { FilesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/FilesFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldFilesValue,
  type FieldFileValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesSchema } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { MultiItemFieldInput } from './MultiItemFieldInput';

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const files = useMemo<FieldFileValue[]>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );

  const parseArrayToFilesValue = (files: FieldFileValue[]) => {
    const nextValue: FieldFilesValue = files;

    const parseResponse = filesSchema.safeParse(nextValue);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedFiles: FieldFileValue[]) => {
    const nextValue = parseArrayToFilesValue(updatedFiles);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const validateInput = useCallback(
    (input: string) => ({
      isValid: input.trim().length > 0,
      errorMessage: '',
    }),
    [],
  );

  const getShowPrimaryIcon = (index: number) =>
    index === 0 && files.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleCopy = (file: FieldFileValue) => {
    copyToClipboard(file.label, t`File name copied to clipboard`);
  };

  const handleClickOutside = (
    updatedFiles: FieldFileValue[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({
      newValue: parseArrayToFilesValue(updatedFiles),
      event,
    });
  };

  const handleEscape = (updatedFiles: FieldFileValue[]) => {
    onEscape?.({ newValue: parseArrayToFilesValue(updatedFiles) });
  };

  const handleEnter = (updatedFiles: FieldFileValue[]) => {
    onEnter?.({ newValue: parseArrayToFilesValue(updatedFiles) });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  // Format simple string input into a FieldFileValue object
  const formatInput = (input: string): FieldFileValue => ({
    fileId: crypto.randomUUID(),
    label: input,
    fileCategory: 'OTHER',
  });

  return (
    <MultiItemFieldInput
      items={files}
      onChange={handleChange}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder={t`File name`}
      fieldMetadataType={FieldMetadataType.FILES}
      validateInput={validateInput}
      formatInput={formatInput}
      renderItem={({
        value: file,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <FilesFieldMenuItem
          key={`${file.fileId}-${index}`}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          showCopyButton={true}
          file={file}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      )}
      onError={handleError}
      maxItemCount={maxNumberOfValues}
    />
  );
};
