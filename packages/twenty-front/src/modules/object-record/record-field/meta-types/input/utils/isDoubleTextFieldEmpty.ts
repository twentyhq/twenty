import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';

export const isDoubleTextFieldEmpty = (doubleText: FieldDoubleText) => {
  const { firstValue, secondValue } = doubleText;

  const totalLength = firstValue.trim().length + secondValue.trim().length;

  return totalLength > 0 ? false : true;
};
