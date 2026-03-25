import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { sumByProperty } from 'twenty-shared/utils';

export const computeVisibleRecordFieldsWidthOnTable = ({
  shouldCompactFirstColumn,
  visibleRecordFields,
}: {
  shouldCompactFirstColumn: boolean;
  visibleRecordFields: Pick<RecordField, 'size'>[];
}) => {
  const visibleRecordFieldsWithoutFirst = visibleRecordFields.slice(1);

  const sumWithoutFirstField = visibleRecordFieldsWithoutFirst.reduce(
    sumByProperty('size'),
    0,
  );

  const sumWithAllFields = visibleRecordFields.reduce(sumByProperty('size'), 0);

  const sumForCompactedFirstColumn =
    RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE + sumWithoutFirstField;

  const sumForNoCompactColumn = sumWithAllFields;

  const visibleRecordFieldsWidth = shouldCompactFirstColumn
    ? sumForCompactedFirstColumn
    : sumForNoCompactColumn;

  return {
    visibleRecordFieldsWidth,
  };
};
