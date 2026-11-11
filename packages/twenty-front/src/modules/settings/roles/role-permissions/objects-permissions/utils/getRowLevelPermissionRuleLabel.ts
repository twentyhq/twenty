import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import {
  isDefined,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';
import { type RowLevelPermissionPredicate } from '~/generated-metadata/graphql';

const getPredicateValueLabel = (predicate: RowLevelPermissionPredicate) => {
  if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
    return t`me`;
  }

  if (isNonEmptyString(predicate.value) || isNumber(predicate.value)) {
    return String(predicate.value);
  }

  return '';
};

export const getRowLevelPermissionRuleLabel = ({
  predicates,
  objectMetadataItem,
}: {
  predicates: RowLevelPermissionPredicate[];
  objectMetadataItem: EnrichedObjectMetadataItem;
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
    mapRLSOperandToRecordFilterOperand(
      firstPredicate.operand as RowLevelPermissionPredicateOperand,
    ),
  ).toLocaleLowerCase();

  const firstPredicateLabel = [
    fieldLabel,
    operandLabel,
    getPredicateValueLabel(firstPredicate),
  ]
    .filter(isNonEmptyString)
    .join(' ');

  if (otherPredicates.length === 0) {
    return firstPredicateLabel;
  }

  const otherPredicateCount = otherPredicates.length;

  return t`${firstPredicateLabel} +${otherPredicateCount}`;
};
