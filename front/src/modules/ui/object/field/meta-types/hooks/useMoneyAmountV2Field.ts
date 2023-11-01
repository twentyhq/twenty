import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldMoneyAmountV2Value } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldMoneyAmountV2 } from '../../types/guards/isFieldMoneyAmountV2';
import { isFieldMoneyAmountV2Value } from '../../types/guards/isFieldMoneyAmountV2Value';

export const useMoneyAmountV2Field = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('moneyAmountV2', isFieldMoneyAmountV2, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldMoneyAmountV2Value>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistMoneyAmountV2Field = (newValue: FieldMoneyAmountV2Value) => {
    if (!isFieldMoneyAmountV2Value(newValue)) {
      return;
    }

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    persistMoneyAmountV2Field,
  };
};
