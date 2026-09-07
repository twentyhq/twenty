import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCalendarTime,
  IconStatusChange,
  IconTextSize,
  type IconComponent,
} from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { CORE_WORKFLOW_STATUS_FILTER_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowStatusFilterOptions';
import { CoreWorkflowFilterFieldKey } from '~/generated/graphql';

export type CoreWorkflowFilterFieldType = 'TEXT' | 'MULTI_SELECT' | 'DATE_TIME';

export type CoreWorkflowFilterFieldOption = {
  value: string;
  label: MessageDescriptor;
  color: ThemeColor;
};

export type CoreWorkflowFilterFieldDefinition = {
  key: CoreWorkflowFilterFieldKey;
  label: MessageDescriptor;
  filterType: CoreWorkflowFilterFieldType;
  Icon: IconComponent;
  options?: CoreWorkflowFilterFieldOption[];
};

export const CORE_WORKFLOW_FILTER_FIELDS: CoreWorkflowFilterFieldDefinition[] =
  [
    {
      key: CoreWorkflowFilterFieldKey.NAME,
      label: msg`Name`,
      filterType: 'TEXT',
      Icon: IconTextSize,
    },
    {
      key: CoreWorkflowFilterFieldKey.STATUSES,
      label: msg`Statuses`,
      filterType: 'MULTI_SELECT',
      Icon: IconStatusChange,
      options: CORE_WORKFLOW_STATUS_FILTER_OPTIONS,
    },
    {
      key: CoreWorkflowFilterFieldKey.UPDATED_AT,
      label: msg`Last update`,
      filterType: 'DATE_TIME',
      Icon: IconCalendarTime,
    },
  ];
