import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { Select } from '@/ui/input/components/Select';
import { EventLogTable } from '~/generated-metadata/graphql';

type EventLogTableSelectorProps = {
  value: EventLogTable;
  onChange: (value: EventLogTable) => void;
};

const TABLE_LABELS: Record<EventLogTable, MessageDescriptor> = {
  [EventLogTable.PAGEVIEW]: msg`Page Views`,
  [EventLogTable.WORKSPACE_EVENT]: msg`Workspace Events`,
  [EventLogTable.OBJECT_EVENT]: msg`Object Events`,
  [EventLogTable.USAGE_EVENT]: msg`Usage Events`,
  [EventLogTable.APPLICATION_LOG]: msg`Application Logs`,
};

export const EventLogTableSelector = ({
  value,
  onChange,
}: EventLogTableSelectorProps) => {
  const { t } = useLingui();

  const options = (
    Object.entries(TABLE_LABELS) as [EventLogTable, MessageDescriptor][]
  ).map(([table, label]) => ({
    value: table,
    label: t(label),
  }));

  return (
    <Select
      dropdownId="event-log-table-selector"
      label={t`Table`}
      fullWidth
      value={value}
      options={options}
      onChange={onChange}
    />
  );
};
