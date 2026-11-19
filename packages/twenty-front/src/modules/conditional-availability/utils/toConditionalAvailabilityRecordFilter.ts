import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { CONDITIONAL_AVAILABILITY_DATE_TIME_DAY_START_SUFFIX } from '@/conditional-availability/constants/ConditionalAvailabilityDateTimeDayStartSuffix';
import { CONDITIONAL_AVAILABILITY_RECORD_FILTER_OPERAND_BY_OPERATOR } from '@/conditional-availability/constants/ConditionalAvailabilityRecordFilterOperandByOperator';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRecordFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldRow = Extract<
  ConditionalAvailabilityRow,
  { subject: 'recordField' }
>;

const toValue = (row: RecordFieldRow): string => {
  const [firstValue] = row.values;

  if (!isDefined(firstValue)) {
    return '';
  }

  switch (row.fieldKind) {
    case 'select':
    case 'multiSelect':
    case 'identifier':
      return JSON.stringify(row.values);
    case 'workspaceMemberRelation':
    case 'recordRelation':
      return JSON.stringify({
        isCurrentWorkspaceMemberSelected: row.values.includes(
          CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE,
        ),
        selectedRecordIds: row.values.filter(
          (value) =>
            value !==
            CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE,
        ),
      });
    case 'dateTime':
      return row.operator === 'is'
        ? firstValue
        : firstValue + CONDITIONAL_AVAILABILITY_DATE_TIME_DAY_START_SUFFIX;
    default:
      return firstValue;
  }
};

export const toConditionalAvailabilityRecordFilter = ({
  row,
}: {
  row: RecordFieldRow;
}): ConditionalAvailabilityRecordFilter => ({
  fieldMetadataUniversalIdentifier: row.fieldMetadataUniversalIdentifier,
  subFieldName: row.subFieldName,
  operand:
    CONDITIONAL_AVAILABILITY_RECORD_FILTER_OPERAND_BY_OPERATOR[row.operator],
  value: toValue(row),
});
