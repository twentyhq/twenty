import { msg } from '@lingui/core/macro';
import {
  IconCalendarTime,
  IconSettings,
  IconStatusChange,
  IconTextSize,
} from 'twenty-ui/icon';

import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { CORE_WORKFLOW_STATUS_FILTER_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowStatusFilterOptions';
import { CoreWorkflowFilterFieldKey } from '~/generated/graphql';

export const CORE_WORKFLOW_FILTER_FIELDS: CoreObjectFilterField<CoreWorkflowFilterFieldKey>[] =
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
    {
      key: CoreWorkflowFilterFieldKey.IS_SYSTEM,
      label: msg`System`,
      filterType: 'BOOLEAN',
      Icon: IconSettings,
    },
  ];
