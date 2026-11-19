import { CONDITIONAL_AVAILABILITY_RECORD_FILTER_OPERAND_BY_OPERATOR } from '@/conditional-availability/constants/ConditionalAvailabilityRecordFilterOperandByOperator';
import { type ConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/types/ConditionalAvailabilityOfferedSubjects';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { getConditionalAvailabilityRecordFieldSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjects';
import { getConditionalAvailabilityRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperators';
import { pickConditionalAvailabilityRow } from '@/conditional-availability/utils/pickConditionalAvailabilityRow';
import { readConditionalAvailabilityRecordFilterValues } from '@/conditional-availability/utils/readConditionalAvailabilityRecordFilterValues';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const readConditionalAvailabilityRecordFilter = ({
  node,
  offeredSubjects,
  fields,
}: {
  node: ConditionalAvailabilityNode;
  offeredSubjects: Pick<ConditionalAvailabilityOfferedSubjects, 'recordField'>;
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityRow | null => {
  if (
    !offeredSubjects.recordField ||
    node.type !== 'SELECTED_RECORDS' ||
    node.quantifier !== 'EVERY'
  ) {
    return null;
  }

  const { recordFilter } = node;

  const recordFieldSubject = fields
    .flatMap((field) =>
      getConditionalAvailabilityRecordFieldSubjects({ field }),
    )
    .find(
      (subject) =>
        subject.fieldMetadataUniversalIdentifier ===
          recordFilter.fieldMetadataUniversalIdentifier &&
        subject.subFieldName === recordFilter.subFieldName,
    );

  if (!isDefined(recordFieldSubject)) {
    return null;
  }

  const values = readConditionalAvailabilityRecordFilterValues({
    fieldKind: recordFieldSubject.fieldKind,
    value: recordFilter.value,
  });

  if (!isDefined(values)) {
    return null;
  }

  const rowSubject: ConditionalAvailabilityRowSubject = {
    subject: 'recordField',
    ...recordFieldSubject,
  };

  return pickConditionalAvailabilityRow({
    rowSubject,
    operators: getConditionalAvailabilityRowOperators({ rowSubject }).filter(
      (operator) =>
        CONDITIONAL_AVAILABILITY_RECORD_FILTER_OPERAND_BY_OPERATOR[operator] ===
        recordFilter.operand,
    ),
    values,
  });
};
