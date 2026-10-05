import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

type AdvancedFilterLogicalOperatorOption = {
  value: RecordFilterGroupLogicalOperator;
  label: MessageDescriptor;
};

export const ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS: AdvancedFilterLogicalOperatorOption[] =
  [
    {
      value: RecordFilterGroupLogicalOperator.AND,
      label: msg`And`,
    },
    {
      value: RecordFilterGroupLogicalOperator.OR,
      label: msg`Or`,
    },
  ];
