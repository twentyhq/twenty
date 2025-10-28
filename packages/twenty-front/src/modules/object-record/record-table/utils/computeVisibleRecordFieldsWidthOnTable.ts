import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { sumByProperty } from 'twenty-shared/utils';

export const computeVisibleRecordFieldsWidthOnTable = ({
  isMobile,
  visibleRecordFields,
}: {
  isMobile: boolean;
  visibleRecordFields: Pick<RecordField, 'size'>[];
}) => {
  const visibleRecordFieldsWithoutFirst = visibleRecordFields.slice(1);

  const sumWithoutFirstField = visibleRecordFieldsWithoutFirst.reduce(
    sumByProperty('size'),
    0,
  );

  const sumWithAllFields = visibleRecordFields.reduce(sumByProperty('size'), 0);

  const sumForMobile =
    RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE + sumWithoutFirstField;

  const sumForNonMobile = sumWithAllFields;

  const visibleRecordFieldsWidth = isMobile ? sumForMobile : sumForNonMobile;

  return {
    visibleRecordFieldsWidth,
  };
};
