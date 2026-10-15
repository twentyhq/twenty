import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/icon';

import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

type CoreObjectSystemFilterChipProps = {
  onRemove: () => void;
};

export const CoreObjectSystemFilterChip = ({
  onRemove,
}: CoreObjectSystemFilterChipProps) => {
  const { t } = useLingui();

  return (
    <SortOrFilterChip
      type="filter"
      labelValue={t`Not system`}
      Icon={IconSettings}
      testId="core-object-system-filter"
      onRemove={onRemove}
    />
  );
};
