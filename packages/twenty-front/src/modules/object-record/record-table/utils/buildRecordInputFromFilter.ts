import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';

import {
  type RecordFilter,
  type RecordFilterToRecordInputOperand,
} from '@/object-record/record-filter/types/RecordFilter';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from 'twenty-shared/types';
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
    case ViewFilterOperand.CONTAINS:
      return value;
    case ViewFilterOperand.IS_NOT_EMPTY:
      return value;
    case ViewFilterOperand.IS_EMPTY:
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

// TODO: fix this with Temporal
const computeValueFromFilterDate = (
  operand: RecordFilterToRecordInputOperand<'DATE_TIME'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_AFTER:
    case ViewFilterOperand.IS_BEFORE:
      return new Date(value);
    case ViewFilterOperand.IS_TODAY:
    case ViewFilterOperand.IS_NOT_EMPTY:
    case ViewFilterOperand.IS_IN_PAST:
    case ViewFilterOperand.IS_IN_FUTURE:
    case ViewFilterOperand.IS_RELATIVE:
      return new Date();
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return Number(value) + 1;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return Number(value) - 1;
    case ViewFilterOperand.IS_NOT_EMPTY:
      return Number(value);
    case ViewFilterOperand.IS:
      return Number(value);
    case ViewFilterOperand.IS_NOT:
      return undefined;
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.IS:
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
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      return value;
    case ViewFilterOperand.DOES_NOT_CONTAIN:
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      return option.value;
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL: {
      const plusOne = options?.find(
        (opt) => opt.position === option.position + 1,
      )?.value;
      return plusOne ? plusOne : option.value;
    }
    case ViewFilterOperand.LESS_THAN_OR_EQUAL: {
      const minusOne = options?.find(
        (opt) => opt.position === option.position - 1,
      )?.value;
      return minusOne ? minusOne : option.value;
    }
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      try {
        const valueParsed = parseJson<string[]>(value)?.[0];
        const option = options?.find((option) => option.value === valueParsed);
        if (!option) {
          return undefined;
        }
        return option.value;
      } catch {
        return undefined;
      }
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      try {
        const parsedValue = parseJson<string[]>(value);
        return parsedValue ? parsedValue : undefined;
      } catch {
        return undefined;
      }
    case ViewFilterOperand.DOES_NOT_CONTAIN:
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.IS: {
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
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_NOT_EMPTY: // todo
    case ViewFilterOperand.IS_EMPTY:
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
    case ViewFilterOperand.VECTOR_SEARCH:
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
    case ViewFilterOperand.IS:
      return value;
    default:
      assertUnreachable(operand);
  }
};
