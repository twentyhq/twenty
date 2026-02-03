import { useLingui } from '@lingui/react/macro';

import { Select } from '@/ui/input/components/Select';
import { EventLogTable } from '~/generated-metadata/graphql';

type EventLogTableSelectorProps = {
  value: EventLogTable;
  onChange: (value: EventLogTable) => void;
};

export const EventLogTableSelector = ({
  value,
  onChange,
}: EventLogTableSelectorProps) => {
  const { t } = useLingui();

  const options = [
    {
      value: EventLogTable.PAGEVIEW,
      label: t`Page Views`,
    },
    {
      value: EventLogTable.WORKSPACE_EVENT,
      label: t`Workspace Events`,
    },
    {
      value: EventLogTable.OBJECT_EVENT,
      label: t`Object Events`,
    },
  ];

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
