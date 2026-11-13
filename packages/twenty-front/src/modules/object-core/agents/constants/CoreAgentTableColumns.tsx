import { msg } from '@lingui/core/macro';
import {
  IconCalendarTime,
  IconCpu,
  IconSum,
  IconTerminal,
  IconTextSize,
} from 'twenty-ui/icon';

import { CoreAgentModelCell } from '@/object-core/agents/components/CoreAgentModelCell';
import { CoreAgentNameCell } from '@/object-core/agents/components/CoreAgentNameCell';
import { type CoreAgentTableRow } from '@/object-core/agents/types/CoreAgentTableRow';
import { CoreObjectRecentRunsCell } from '@/object-core/components/cells/CoreObjectRecentRunsCell';
import { CoreObjectRunCountCell } from '@/object-core/components/cells/CoreObjectRunCountCell';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const CORE_AGENT_TABLE_COLUMNS: CoreObjectTableColumn<CoreAgentTableRow>[] =
  [
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
      fieldName: 'recentRuns',
      fieldLabel: msg`Recent runs`,
      FieldIcon: IconTerminal,
      align: 'left',
      gridTrack: '120px',
      renderCell: (agent) => (
        <CoreObjectRecentRunsCell recentRuns={agent.recentRuns} />
      ),
    },
    {
      fieldName: 'lastRunAt',
      fieldLabel: msg`Last run`,
      FieldIcon: IconCalendarTime,
      align: 'left',
      gridTrack: '150px',
      renderCell: (agent) => (
        <DateTimeDisplay
          value={agent.lastRunAt}
          dateFieldSettings={{ displayFormat: FieldDateDisplayFormat.RELATIVE }}
        />
      ),
    },
    {
      fieldName: 'runCountLast14Days',
      fieldLabel: msg`Runs · 14d`,
      FieldIcon: IconSum,
      align: 'right',
      gridTrack: '100px',
      renderCell: (agent) => (
        <CoreObjectRunCountCell
          runCount={agent.runCountLast14Days}
          isLowerBound={false}
        />
      ),
    },
    {
      fieldName: 'updatedAt',
      fieldLabel: msg`Last update`,
      FieldIcon: IconCalendarTime,
      fieldType: 'string',
      align: 'left',
      gridTrack: '150px',
      renderCell: (agent) => (
        <DateTimeDisplay
          value={agent.updatedAt}
          dateFieldSettings={{ displayFormat: FieldDateDisplayFormat.RELATIVE }}
        />
      ),
    },
  ];
