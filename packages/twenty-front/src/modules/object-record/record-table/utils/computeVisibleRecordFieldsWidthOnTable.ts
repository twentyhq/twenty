import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined, sumByProperty } from 'twenty-shared/utils';

export const computeVisibleRecordFieldsWidthOnTable = ({
  firstColumnWidthOverride,
  visibleRecordFields,
}: {
  firstColumnWidthOverride?: number;
  visibleRecordFields: Pick<RecordField, 'size'>[];
}) => {
  const sumOfAllFields = visibleRecordFields.reduce(sumByProperty('size'), 0);

  const firstRecordField = visibleRecordFields[0];

  if (!isDefined(firstColumnWidthOverride) || !isDefined(firstRecordField)) {
    return {
      visibleRecordFieldsWidth: sumOfAllFields,
    };
  }

  return {
    visibleRecordFieldsWidth:
      sumOfAllFields - firstRecordField.size + firstColumnWidthOverride,
  };
};
