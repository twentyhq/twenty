import { type TimelineActivityScope } from '@/activities/timeline-activities/types/TimelineActivityScope';
import { useLingui } from '@lingui/react/macro';
import { SegmentedControl } from 'twenty-ui/input';

type TimelineScopeFilterProps = {
  scope: TimelineActivityScope;
  onChange: (scope: TimelineActivityScope) => void;
};

export const TimelineScopeFilter = ({
  scope,
  onChange,
}: TimelineScopeFilterProps) => {
  const { t } = useLingui();

  return (
    <SegmentedControl<TimelineActivityScope>
      ariaLabel={t`Filter timeline`}
      value={scope}
      onChange={onChange}
      itemWidth="content"
      options={[
        { value: 'all', label: t`All` },
        { value: 'activity', label: t`Activity` },
        { value: 'history', label: t`History` },
      ]}
    />
  );
};
