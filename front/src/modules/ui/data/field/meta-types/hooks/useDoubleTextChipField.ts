import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldDoubleTextChip } from '../../types/guards/isFieldDoubleTextChip';

export const useDoubleTextChipField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    'double-text-chip',
    isFieldDoubleTextChip,
    fieldDefinition,
  );

  const [firstValue, setFirstValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const [avatarUrl, setAvatarUrl] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldDefinition.metadata.avatarUrlFieldName,
    }),
  );

  const fullValue = [firstValue, secondValue].filter(Boolean).join(' ');

  const entityType = fieldDefinition.metadata.entityType;

  return {
    fieldDefinition,
    avatarUrl,
    setAvatarUrl,
    secondValue,
    setSecondValue,
    firstValue,
    setFirstValue,
    fullValue,
    entityType,
    entityId,
    hotkeyScope,
  };
};
