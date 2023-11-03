import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldChip } from '../../types/guards/isFieldChip';

export const useChipField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('chip', isFieldChip, fieldDefinition);

  const contentFieldName = fieldDefinition.metadata.contentFieldName;
  const avatarUrlFieldName = fieldDefinition.metadata.urlFieldName;

  const [contentFieldValue, setContentFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: contentFieldName,
    }),
  );

  const [avatarFieldValue, setAvatarFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: avatarUrlFieldName,
    }),
  );

  const entityType = fieldDefinition.metadata.relationType;

  const fieldInitialValue = useFieldInitialValue();

  const initialContentValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? contentFieldValue;

  const initialAvatarValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value
    ? ''
    : avatarFieldValue;

  return {
    fieldDefinition,
    contentFieldValue,
    initialContentValue,
    setContentFieldValue,
    avatarFieldValue,
    initialAvatarValue,
    setAvatarFieldValue,
    entityType,
    entityId,
    hotkeyScope,
  };
};
