import { msg } from '@lingui/core/macro';
import { IconCalendarTime, IconCpu, IconTextSize } from 'twenty-ui/icon';

import { CoreAgentModelCell } from '@/object-core/agents/components/CoreAgentModelCell';
import { CoreAgentNameCell } from '@/object-core/agents/components/CoreAgentNameCell';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const CORE_AGENT_TABLE_COLUMNS: CoreObjectTableColumn<CoreAgent>[] = [
  {
    fieldName: 'label',
    fieldLabel: msg`Name`,
    FieldIcon: IconTextSize,
    fieldType: 'string',
    align: 'left',
    gridTrack: 'minmax(200px, 1fr)',
    renderCell: (agent) => <CoreAgentNameCell agent={agent} />,
  },
  {
    fieldName: 'modelId',
    fieldLabel: msg`Model`,
    FieldIcon: IconCpu,
    align: 'left',
    gridTrack: '200px',
    renderCell: (agent) => <CoreAgentModelCell modelId={agent.modelId} />,
  },
  {
    fieldName: 'updatedAt',
    fieldLabel: msg`Last update`,
    FieldIcon: IconCalendarTime,
    fieldType: 'string',
    align: 'left',
    gridTrack: '150px',
    renderCell: (agent) => <DateTimeDisplay value={agent.updatedAt} />,
  },
];
