import { useLingui } from '@lingui/react/macro';

import { APPLICATION_MONITORING_PERIODS } from '@/settings/application-monitoring/constants/ApplicationMonitoringPeriods';
import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';
import { Select } from '@/ui/input/components/Select';

type ApplicationMonitoringPeriodSelectProps = {
  dropdownId: string;
  value: ApplicationMonitoringPeriod;
  lookbackInHours: number;
  onChange: (period: ApplicationMonitoringPeriod) => void;
};

export const ApplicationMonitoringPeriodSelect = ({
  dropdownId,
  value,
  lookbackInHours,
  onChange,
}: ApplicationMonitoringPeriodSelectProps) => {
  const { i18n } = useLingui();

  return (
    <Select
      dropdownId={dropdownId}
      value={value}
      options={APPLICATION_MONITORING_PERIODS.map((period) => ({
        value: period.value,
        label: i18n._(period.label),
        disabled: period.hours > lookbackInHours,
      }))}
      onChange={onChange}
      needIconCheck
      selectSizeVariant="small"
    />
  );
};
