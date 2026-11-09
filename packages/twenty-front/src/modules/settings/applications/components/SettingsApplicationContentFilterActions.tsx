import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

import { SettingsApplicationContentFilterDropdown } from '@/settings/applications/components/SettingsApplicationContentFilterDropdown';
import { useSetApplicationContentFilterValue } from '@/settings/applications/hooks/useSetApplicationContentFilterValue';
import { APPLICATION_CONTENT_FILTER_LABELS } from '@/settings/applications/constants/ApplicationContentFilterLabels';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

type SettingsApplicationContentFilterActionsProps = {
  activeFilters: {
    key: ApplicationContentFilterKey;
    selectedOption: ApplicationContentFilterOption;
  }[];
  selectableFilter?: {
    key: ApplicationContentFilterKey;
    options: ApplicationContentFilterOption[];
  };
  selectedSelectableValue: string | null;
};

export const SettingsApplicationContentFilterActions = ({
  activeFilters,
  selectableFilter,
  selectedSelectableValue,
}: SettingsApplicationContentFilterActionsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const setFilterValue = useSetApplicationContentFilterValue();

  return (
    <>
      {activeFilters.map(({ key, selectedOption }) => (
        <SortOrFilterChip
          key={key}
          type="filter"
          labelKey={t(APPLICATION_CONTENT_FILTER_LABELS[key])}
          labelValue={`: ${selectedOption.label}`}
          Icon={getIcon(selectedOption.icon)}
          onRemove={() =>
            setFilterValue({ filterKey: key, universalIdentifier: null })
          }
        />
      ))}
      {isDefined(selectableFilter) && (
        <SettingsApplicationContentFilterDropdown
          filterKey={selectableFilter.key}
          options={selectableFilter.options}
          selectedUniversalIdentifier={selectedSelectableValue}
        />
      )}
    </>
  );
};
