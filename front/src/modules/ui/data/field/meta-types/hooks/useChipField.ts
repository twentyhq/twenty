import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
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

  return {
    fieldDefinition,
    contentFieldValue,
    setContentFieldValue,
    avatarFieldValue,
    setAvatarFieldValue,
    entityType,
    entityId,
    hotkeyScope,
  };
};
