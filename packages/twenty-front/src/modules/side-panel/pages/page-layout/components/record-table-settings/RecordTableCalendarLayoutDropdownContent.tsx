import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { t } from '@lingui/core/macro';
import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarWeek,
} from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type RecordTableCalendarLayoutDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  currentCalendarLayout: ViewCalendarLayout;
};

export const RecordTableCalendarLayoutDropdownContent = ({
  pageLayoutId,
  widgetId,
  currentCalendarLayout,
}: RecordTableCalendarLayoutDropdownContentProps) => {
  const { handleCalendarLayoutChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const calendarLayoutOptions = [
    { value: ViewCalendarLayout.DAY, label: t`Day`, Icon: IconCalendarEvent },
    { value: ViewCalendarLayout.WEEK, label: t`Week`, Icon: IconCalendarWeek },
    {
      value: ViewCalendarLayout.MONTH,
      label: t`Month`,
      Icon: IconCalendarMonth,
    },
  ];

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Calendar view`}
        value={currentCalendarLayout}
      >
        {calendarLayoutOptions.map(({ value, label, Icon }) => (
          <Dropdown.OptionItem
            key={value}
            value={value}
            onSelect={() => handleCalendarLayoutChange(value)}
            startIcon={<SelectOptionIcon Icon={Icon} />}
          >
            {label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
