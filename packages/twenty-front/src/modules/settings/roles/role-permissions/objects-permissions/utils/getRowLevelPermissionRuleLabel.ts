import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import {
  isDefined,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';
import { type RowLevelPermissionPredicate } from '~/generated-metadata/graphql';

const getPredicateValueLabel = ({
  predicate,
  workspaceMemberObjectMetadataItem,
}: {
  predicate: RowLevelPermissionPredicate;
  workspaceMemberObjectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'fields'
  >;
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
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  workspaceMemberObjectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'fields'
  >;
}) => {
  const [firstPredicate, ...otherPredicates] = predicates;

  if (!isDefined(firstPredicate)) {
    return '';
  }

  const fieldLabel =
    objectMetadataItem.fields.find(
      (field) => field.id === firstPredicate.fieldMetadataId,
    )?.label ?? '';

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
