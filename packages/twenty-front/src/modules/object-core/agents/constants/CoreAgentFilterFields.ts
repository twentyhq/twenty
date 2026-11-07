import { msg } from '@lingui/core/macro';
import { IconSettings, IconTextSize } from 'twenty-ui/icon';

import { type CoreAgentFilterFieldKey } from '@/object-core/agents/types/CoreAgentFilterFieldKey';
import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';

export const CORE_AGENT_FILTER_FIELDS: CoreObjectFilterField<CoreAgentFilterFieldKey>[] =
  [
    {
      key: 'NAME',
      label: msg`Name`,
      filterType: 'TEXT',
      Icon: IconTextSize,
    },
    {
      key: 'IS_SYSTEM',
      label: msg`System`,
      filterType: 'BOOLEAN',
      Icon: IconSettings,
    },
  ];
