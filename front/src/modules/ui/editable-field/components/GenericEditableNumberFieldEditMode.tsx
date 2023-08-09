import { useContext, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldNumberMetadata,
} from '@/ui/editable-field/types/ViewField';
import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EntityIdContext } from '../states/EntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldNumberMetadata>;
};

export function GenericEditableNumberFieldEditMode({ viewField }: OwnProps) {
  const currentEntityId = useContext(EntityIdContext);

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<number | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );
  const [internalValue, setInternalValue] = useState(
    fieldValue ? fieldValue.toString() : '',
  );

  const updateField = useUpdateGenericEntityField();

  function handleSubmit() {
    if (!canBeCastAsIntegerOrNull(internalValue)) {
      return;
    }
    if (internalValue === fieldValue) return;

    setFieldValue(castAsIntegerOrNull(internalValue));

    if (currentEntityId && updateField) {
      updateField(
        currentEntityId,
        viewField,
        castAsIntegerOrNull(internalValue),
      );
    }
  }

  function onCancel() {
    setFieldValue(fieldValue);
  }

  function handleChange(newValue: string) {
    setInternalValue(newValue);
  }
  const wrapperRef = useRef(null);

  useRegisterCloseFieldHandlers(wrapperRef, handleSubmit, onCancel);

  return (
    <div ref={wrapperRef}>
      <TextInputEdit
        autoFocus
        value={internalValue ? internalValue.toString() : ''}
        onChange={(newValue: string) => {
          handleChange(newValue);
        }}
      />
    </div>
  );
}
