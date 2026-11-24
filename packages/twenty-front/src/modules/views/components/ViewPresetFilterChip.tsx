import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { VIEW_PRESET_FILTER_LABELS } from '@/views/constants/ViewPresetFilterLabels';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/icon';
import { type ViewPresetFilter } from '~/generated-metadata/graphql';

type ViewPresetFilterChipProps = {
  presetFilter: ViewPresetFilter;
};

export const ViewPresetFilterChip = ({
  presetFilter,
}: ViewPresetFilterChipProps) => {
  const { t } = useLingui();

  return (
    <SortOrFilterChip
      testId={`view-preset-filter-${presetFilter}`}
      labelKey={t`Status`}
      labelValue={`: ${t(VIEW_PRESET_FILTER_LABELS[presetFilter])}`}
      Icon={IconFilter}
      type="filter"
    />
  );
};
