import { useContext } from 'react';

import { ColumnIndexContext } from '../../record-table/contexts/ColumnIndexContext';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldChip } from '../types/guards/isFieldChip';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDoubleText } from '../types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldMoney } from '../types/guards/isFieldMoney';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldURL } from '../types/guards/isFieldURL';

import { useIsFieldEmpty } from './useIsFieldEmpty';
import { usePersistField } from './usePersistField';

export const useResetField = () => {
  const { fieldDefinition } = useContext(FieldContext);
  const persistField = usePersistField();

  const isFieldEmpty = useIsFieldEmpty();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const resetField = () => {
    if (
      (isFirstColumnCell && fieldDefinition.basePathToShowPage) ||
      isFieldEmpty
    ) {
      return;
    }

    const resetValue = isFieldRelation(fieldDefinition)
      ? null
      : isFieldText(fieldDefinition)
      ? ''
      : isFieldEmail(fieldDefinition)
      ? ''
      : isFieldDate(fieldDefinition)
      ? 'return'
      : isFieldNumber(fieldDefinition)
      ? ''
      : isFieldURL(fieldDefinition)
      ? ''
      : isFieldPhone(fieldDefinition)
      ? ''
      : isFieldBoolean(fieldDefinition)
      ? false
      : isFieldProbability(fieldDefinition)
      ? ''
      : isFieldChip(fieldDefinition)
      ? ''
      : isFieldDoubleTextChip(fieldDefinition)
      ? { firstValue: '', secondValue: '' }
      : isFieldDoubleText(fieldDefinition)
      ? { firstValue: '', secondValue: '' }
      : isFieldMoney(fieldDefinition)
      ? null
      : '';
    if (resetValue === 'return') {
      return;
    }
    persistField(resetValue);
  };

  return resetField;
};
