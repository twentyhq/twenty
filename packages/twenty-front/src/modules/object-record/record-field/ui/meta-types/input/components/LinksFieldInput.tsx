import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { LinksMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksMultiItemInput';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

export const LinksFieldInput = () => {
  const { draftValue, fieldDefinition, setDraftValue } = useLinksField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: LinkRecord[]) => {
    setRecordFieldInputIsFieldInError(hasError && values.length === 0);
  };

  return (
    <LinksMultiItemInput
      value={draftValue}
      fieldName={fieldDefinition.metadata.fieldName}
      settings={fieldDefinition.metadata.settings}
      onChange={setDraftValue}
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
