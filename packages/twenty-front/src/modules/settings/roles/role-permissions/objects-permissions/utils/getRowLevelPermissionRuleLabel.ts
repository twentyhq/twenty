import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { RecordFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  mapRLSOperandToRecordFilterOperand,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';
import { type RowLevelPermissionPredicate } from '~/generated-metadata/graphql';

const getPredicateValueLabel = ({
  predicate,
  workspaceMemberObjectMetadataItem,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    | 'workspaceMemberFieldMetadataId'
    | 'workspaceMemberSubFieldName'
    | 'value'
    | 'operand'
  >;
  workspaceMemberObjectMetadataItem?: {
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'label'>[];
  };
}) => {
  if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
    const workspaceMemberField = workspaceMemberObjectMetadataItem?.fields.find(
      (field) => field.id === predicate.workspaceMemberFieldMetadataId,
    );

    if (
      !isDefined(workspaceMemberField) ||
      workspaceMemberField.name === 'id'
    ) {
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

  const relativeDateFilter =
    mapRLSOperandToRecordFilterOperand(predicate.operand) ===
      RecordFilterOperand.IS_RELATIVE && isString(predicate.value)
      ? resolveRelativeDateFilterStringified(predicate.value)
      : null;

  if (isDefined(relativeDateFilter)) {
    return getRelativeDateDisplayValue(relativeDateFilter).toLocaleLowerCase();
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
}: {
  predicates: RowLevelPermissionPredicate[];
  objectMetadataItem: { fields: Pick<FieldMetadataItem, 'id' | 'label'>[] };
  workspaceMemberObjectMetadataItem?: {
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'label'>[];
  };
}) => {
  const [firstPredicate, ...otherPredicates] = predicates;

  if (!isDefined(firstPredicate)) {
    return '';
  }

  const fieldLabel =
    objectMetadataItem.fields.find(
      (field) => field.id === firstPredicate.fieldMetadataId,
    )?.label ?? t`Unknown field`;

  const operandLabel = getOperandLabel(
    mapRLSOperandToRecordFilterOperand(firstPredicate.operand),
  ).toLocaleLowerCase();

  const firstPredicateLabel = [
    fieldLabel,
    operandLabel,
    getPredicateValueLabel({
      predicate: firstPredicate,
      workspaceMemberObjectMetadataItem,
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
