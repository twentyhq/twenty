import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';

import {
  RecordFilter,
  RecordFilterInput,
  RecordFilterToRecordInputOperand,
} from '@/object-record/record-filter/types/RecordFilter';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { assertUnreachable } from 'twenty-shared/utils';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

export const buildValueFromFilter = ({
  filter,
  options,
  relationType,
  currentWorkspaceMember,
  label,
}: {
  filter: RecordFilter;
  options?: FieldMetadataItemOption[];
  relationType?: RelationDefinitionType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  label?: string;
}) => {
  if (isCompositeField(filter.type)) {
    return;
  }

  if (filter.type === 'RAW_JSON') {
    return;
  }

  const operands = FILTER_OPERANDS_MAP[filter.type];
  if (!operands.some((operand) => operand === filter.operand)) {
    throw new Error('Operand not supported for this field type');
  }

  switch (filter.type) {
    case 'TEXT': {
      return computeValueFromFilterText(
        filter.operand as RecordFilterInput<'TEXT'>['operand'],
        filter.value,
      );
    }
    case 'RATING':
      return computeValueFromFilterRating(
        filter.operand as RecordFilterInput<'RATING'>['operand'],
        filter.value,
        options,
      );
    case 'DATE_TIME':
    case 'DATE':
      return computeValueFromFilterDate(
        filter.operand as RecordFilterInput<'DATE_TIME'>['operand'],
        filter.value,
      );
    case 'NUMBER':
      return computeValueFromFilterNumber(
        filter.operand as RecordFilterInput<'NUMBER'>['operand'],
        filter.value,
      );
    case 'BOOLEAN':
      return computeValueFromFilterBoolean(
        filter.operand as RecordFilterInput<'BOOLEAN'>['operand'],
        filter.value,
      );
    case 'ARRAY':
      return computeValueFromFilterArray(
        filter.operand as RecordFilterInput<'ARRAY'>['operand'],
        filter.value,
      );
    case 'SELECT':
      return computeValueFromFilterSelect(
        filter.operand as RecordFilterInput<'SELECT'>['operand'],
        filter.value,
        options,
      );
    case 'MULTI_SELECT':
      return computeValueFromFilterMultiSelect(
        filter.operand as RecordFilterInput<'MULTI_SELECT'>['operand'],
        filter.value,
      );
    case 'RELATION': {
      return computeValueFromFilterRelation(
        filter.operand as RecordFilterInput<'RELATION'>['operand'],
        filter.value,
        relationType,
        currentWorkspaceMember,
        label,
      );
    }
    default:
      assertUnreachable(filter.type);
  }
};

const computeValueFromFilterText = (
  operand: RecordFilterToRecordInputOperand<'TEXT'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      return value;
    case ViewFilterOperand.IsNotEmpty:
      return value;
    case ViewFilterOperand.IsEmpty:
    case ViewFilterOperand.DoesNotContain:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterDate = (
  operand: RecordFilterToRecordInputOperand<'DATE_TIME'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
    case ViewFilterOperand.IsNotEmpty:
    case ViewFilterOperand.IsAfter:
    case ViewFilterOperand.IsBefore:
    case ViewFilterOperand.IsInPast:
    case ViewFilterOperand.IsInFuture:
      return new Date(value);
    case ViewFilterOperand.IsToday:
    case ViewFilterOperand.IsRelative:
      return new Date();
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterNumber = (
  operand: RecordFilterToRecordInputOperand<'NUMBER'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.GreaterThan:
      return Number(value) + 1;
    case ViewFilterOperand.LessThan:
      return Number(value) - 1;
    case ViewFilterOperand.IsNotEmpty:
      return Number(value);
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterBoolean = (
  operand: RecordFilterToRecordInputOperand<'BOOLEAN'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      return value === 'true';
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterArray = (
  operand: RecordFilterToRecordInputOperand<'ARRAY'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
    case ViewFilterOperand.IsNotEmpty:
      return value;
    case ViewFilterOperand.DoesNotContain:
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterRating = (
  operand: RecordFilterToRecordInputOperand<'RATING'>,
  value: string,
  options?: FieldMetadataItemOption[],
) => {
  const option = options?.find((option) => option.label === value);
  if (!option) {
    return undefined;
  }

  switch (operand) {
    case ViewFilterOperand.Is:
    case ViewFilterOperand.IsNotEmpty:
    case ViewFilterOperand.GreaterThan:
    case ViewFilterOperand.LessThan:
      return option.value;
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterSelect = (
  operand: RecordFilterToRecordInputOperand<'SELECT'>,
  value: string,
  options?: FieldMetadataItemOption[],
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
    case ViewFilterOperand.IsNotEmpty:
      try {
        const valueParsed = JSON.parse(value)?.[0];
        const option = options?.find((option) => option.value === valueParsed);
        if (!option) {
          return undefined;
        }
        return option.value;
      } catch (error) {
        return undefined;
      }
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterMultiSelect = (
  operand: RecordFilterToRecordInputOperand<'MULTI_SELECT'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
    case ViewFilterOperand.IsNotEmpty:
      try {
        return JSON.parse(value);
      } catch (error) {
        return undefined;
      }
    case ViewFilterOperand.DoesNotContain:
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterRelation = (
  operand: RecordFilterToRecordInputOperand<'RELATION'>,
  value: string,
  relationType?: RelationDefinitionType,
  currentWorkspaceMember?: CurrentWorkspaceMember,
  label?: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      if (
        relationType === RelationDefinitionType.MANY_TO_ONE ||
        relationType === RelationDefinitionType.ONE_TO_ONE
      ) {
        if (label === 'Assignee') {
          return JSON.parse(value).isCurrentWorkspaceMemberSelected
            ? currentWorkspaceMember?.id
            : undefined;
        } else {
          return JSON.parse(value).selectedRecordIds?.[0];
        }
      }
      return JSON.parse(value).selectedRecordIds;
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.IsNotEmpty: // todo
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};
