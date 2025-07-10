import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';

import {
  RecordFilter,
  RecordFilterToRecordInputOperand,
} from '@/object-record/record-filter/types/RecordFilter';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { assertUnreachable, parseJson } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const buildValueFromFilter = ({
  filter,
  options,
  relationType,
  currentWorkspaceMember,
  label,
}: {
  filter: RecordFilter;
  options?: FieldMetadataItemOption[];
  relationType?: RelationType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  label?: string;
}) => {
  if (isCompositeFieldType(filter.type)) {
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
        filter.operand as (typeof FILTER_OPERANDS_MAP)['TEXT'][number],
        filter.value,
      );
    }
    case 'RATING':
      return computeValueFromFilterRating(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['RATING'][number],
        filter.value,
        options,
      );
    case 'DATE_TIME':
    case 'DATE':
      return computeValueFromFilterDate(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['DATE_TIME'][number],
        filter.value,
      );
    case 'NUMBER':
      return computeValueFromFilterNumber(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['NUMBER'][number],
        filter.value,
      );
    case 'BOOLEAN':
      return computeValueFromFilterBoolean(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['BOOLEAN'][number],
        filter.value,
      );
    case 'TS_VECTOR':
      return computeValueFromFilterTSVector(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['TS_VECTOR'][number],
        filter.value,
      );
    case 'ARRAY':
      return computeValueFromFilterArray(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['ARRAY'][number],
        filter.value,
      );
    case 'SELECT':
      return computeValueFromFilterSelect(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['SELECT'][number],
        filter.value,
        options,
      );
    case 'MULTI_SELECT':
      return computeValueFromFilterMultiSelect(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['MULTI_SELECT'][number],
        filter.value,
      );
    case 'RELATION': {
      return computeValueFromFilterRelation(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['RELATION'][number],
        filter.value,
        relationType,
        currentWorkspaceMember,
        label,
      );
    }
    case 'UUID':
      return computeValueFromFilterUUID(
        filter.operand as (typeof FILTER_OPERANDS_MAP)['UUID'][number],
        filter.value,
      );
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
    case ViewFilterOperand.IsAfter:
    case ViewFilterOperand.IsBefore:
      return new Date(value);
    case ViewFilterOperand.IsToday:
    case ViewFilterOperand.IsNotEmpty:
    case ViewFilterOperand.IsInPast:
    case ViewFilterOperand.IsInFuture:
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
    //TODO: we shouln't create values from those filters as it makes no sense for the user
    case ViewFilterOperand.GreaterThanOrEqual:
      return Number(value) + 1;
    case ViewFilterOperand.LessThanOrEqual:
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
      return option.value;
    case ViewFilterOperand.GreaterThanOrEqual: {
      const plusOne = options?.find(
        (opt) => opt.position === option.position + 1,
      )?.value;
      return plusOne ? plusOne : option.value;
    }
    case ViewFilterOperand.LessThanOrEqual: {
      const minusOne = options?.find(
        (opt) => opt.position === option.position - 1,
      )?.value;
      return minusOne ? minusOne : option.value;
    }
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
        const valueParsed = parseJson<string[]>(value)?.[0];
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
        const parsedValue = parseJson<string[]>(value);
        return parsedValue ? parsedValue : undefined;
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
  relationType?: RelationType,
  currentWorkspaceMember?: CurrentWorkspaceMember,
  label?: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is: {
      const parsedValue = parseJson<{
        isCurrentWorkspaceMemberSelected: boolean;
        selectedRecordIds: string[];
      }>(value);
      if (relationType === RelationType.MANY_TO_ONE) {
        if (label === 'Assignee') {
          return parsedValue?.isCurrentWorkspaceMemberSelected
            ? currentWorkspaceMember?.id
            : undefined;
        } else {
          return parsedValue?.selectedRecordIds?.[0];
        }
      }
      return undefined; //todo
    }
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.IsNotEmpty: // todo
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterTSVector = (
  operand: RecordFilterToRecordInputOperand<'TS_VECTOR'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.VectorSearch:
      return value;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterUUID = (
  operand: RecordFilterToRecordInputOperand<'UUID'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      return value;
    default:
      assertUnreachable(operand);
  }
};
