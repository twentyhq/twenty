import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFilesField } from '@/object-record/record-field/ui/meta-types/hooks/useFilesField';
import { FilesMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/FilesMultiItemInput';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

export const FilesFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useFilesField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const files = (draftValue ?? []) as FieldFilesValue[];

  const handleChange = (updatedFiles: FieldFilesValue[]) => {
    setDraftValue(updatedFiles);

    // This input renders nothing without files, so close it once the last is gone; persisting is left to onSubmit.
    if (updatedFiles.length === 0) {
      onEnter?.({ newValue: updatedFiles, skipPersist: true });
    }
  };

  const handleError = (hasError: boolean, values: FieldFilesValue[]) => {
    setRecordFieldInputIsFieldInError(hasError && values.length === 0);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <FilesMultiItemInput
      value={files}
      fieldName={fieldDefinition.metadata.fieldName}
      fieldMetadataId={fieldDefinition.fieldMetadataId}
      maxNumberOfValues={fieldDefinition.metadata.settings?.maxNumberOfValues}
      onChange={handleChange}
      onFilesUploaded={(newValue) => onEnter?.({ newValue })}
      onEnter={(newValue) => onEnter?.({ newValue })}
      onSubmit={(newValue) => onSubmit?.({ newValue, skipClose: true })}
      onEscape={(newValue) => onEscape?.({ newValue })}
      onClickOutside={(newValue, event) =>
        onClickOutside?.({ newValue, event })
      }
      onError={handleError}
    />
  );
};
