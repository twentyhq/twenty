import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { t } from '@lingui/core/macro';
import { isArray, isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { FieldMetadataType, RecordFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  mapRLSOperandToRecordFilterOperand,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';
import { type RowLevelPermissionPredicate } from '~/generated-metadata/graphql';

const getRelationValueLabel = ({
  value,
  recordLabelById,
}: {
  value: RowLevelPermissionPredicate['value'];
  recordLabelById?: Map<string, string>;
}) => {
  const recordIds = (isArray(value) ? value : [value]).filter(isNonEmptyString);
  const recordLabels = recordIds.map((recordId) =>
    recordLabelById?.get(recordId),
  );

  if (recordLabels.every(isNonEmptyString)) {
    return recordLabels.join(', ');
  }

  const recordCount = recordIds.length;

  return recordCount === 1 ? t`1 record` : t`${recordCount} records`;
};

const getPredicateValueLabel = ({
  predicate,
  field,
  workspaceMemberObjectMetadataItem,
  recordLabelById,
  dateValueLabel,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    | 'workspaceMemberFieldMetadataId'
    | 'workspaceMemberSubFieldName'
    | 'value'
    | 'operand'
  >;
  field?: Pick<FieldMetadataItem, 'type'>;
  workspaceMemberObjectMetadataItem?: {
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'label'>[];
  };
  recordLabelById?: Map<string, string>;
  dateValueLabel?: string;
}) => {
  if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
    const workspaceMemberField = workspaceMemberObjectMetadataItem?.fields.find(
      (field) => field.id === predicate.workspaceMemberFieldMetadataId,
    );

    if (!isDefined(workspaceMemberField)) {
      return t`my unknown field`;
    }

    if (workspaceMemberField.name === 'id') {
      return t`me`;
    }

    const workspaceMemberFieldLabel = [
      workspaceMemberField.label,
      predicate.workspaceMemberSubFieldName,
    ]
      .filter(isNonEmptyString)
      .join(' ');

    return t`my ${workspaceMemberFieldLabel}`;
  }

  if (field?.type === FieldMetadataType.RELATION) {
    return getRelationValueLabel({ value: predicate.value, recordLabelById });
  }

  const relativeDateFilter =
    mapRLSOperandToRecordFilterOperand(predicate.operand) ===
      RecordFilterOperand.IS_RELATIVE && isString(predicate.value)
      ? resolveRelativeDateFilterStringified(predicate.value)
      : null;

  if (isDefined(relativeDateFilter)) {
    return getRelativeDateDisplayValue(relativeDateFilter).toLocaleLowerCase();
  }

  if (isDefined(dateValueLabel)) {
    return dateValueLabel;
  }

  if (isNonEmptyString(predicate.value) || isNumber(predicate.value)) {
    return String(predicate.value);
  }

  return '';
};

export const getRowLevelPermissionRuleLabel = ({
  predicates,
  objectMetadataItem,
  workspaceMemberObjectMetadataItem,
  recordLabelById,
  getDateValueLabel,
}: {
  predicates: RowLevelPermissionPredicate[];
  objectMetadataItem: {
    fields: Pick<FieldMetadataItem, 'id' | 'label' | 'type'>[];
  };
  workspaceMemberObjectMetadataItem?: {
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'label'>[];
  };
  recordLabelById?: Map<string, string>;
  getDateValueLabel?: (predicate: RowLevelPermissionPredicate) => string;
}) => {
  const [firstPredicate, ...otherPredicates] = predicates;

  if (!isDefined(firstPredicate)) {
    return '';
  }

  const field = objectMetadataItem.fields.find(
    (objectField) => objectField.id === firstPredicate.fieldMetadataId,
  );
  const fieldLabel = field?.label ?? t`Unknown field`;

  const isDateValue =
    isNonEmptyString(firstPredicate.value) &&
    (field?.type === FieldMetadataType.DATE ||
      field?.type === FieldMetadataType.DATE_TIME);

  const operandLabel = getOperandLabel(
    mapRLSOperandToRecordFilterOperand(firstPredicate.operand),
  ).toLocaleLowerCase();

  const firstPredicateLabel = [
    fieldLabel,
    operandLabel,
    getPredicateValueLabel({
      predicate: firstPredicate,
      field,
      workspaceMemberObjectMetadataItem,
      recordLabelById,
      dateValueLabel: isDateValue
        ? getDateValueLabel?.(firstPredicate)
        : undefined,
    }),
  ]
    .filter(isNonEmptyString)
    .join(' ');

  if (otherPredicates.length === 0) {
    return firstPredicateLabel;
  }

  const otherPredicateCount = otherPredicates.length;

  return t`${firstPredicateLabel} +${otherPredicateCount}`;
};
