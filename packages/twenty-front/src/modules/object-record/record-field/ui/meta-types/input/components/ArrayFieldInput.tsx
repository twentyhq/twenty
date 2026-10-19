import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/ArrayMultiItemInput';
import { useContext } from 'react';

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  return (
    <ArrayMultiItemInput
      value={Array.isArray(draftValue) ? draftValue : null}
      fieldName={fieldDefinition.metadata.fieldName}
      maxNumberOfValues={fieldDefinition.metadata.settings?.maxNumberOfValues}
      onChange={setDraftValue}
      onEnter={(newValue) => onEnter?.({ newValue })}
      onSubmit={(newValue) => onSubmit?.({ newValue, skipClose: true })}
      onEscape={(newValue) => onEscape?.({ newValue })}
      onClickOutside={(newValue, event) =>
        onClickOutside?.({ newValue, event })
      }
    />
  );
};
