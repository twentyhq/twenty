import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

import { SettingsApplicationContentFilterDropdown } from '@/settings/applications/components/SettingsApplicationContentFilterDropdown';
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
  onFilterChange: (filterChange: {
    filterKey: ApplicationContentFilterKey;
    universalIdentifier: string | null;
  }) => void;
};

export const SettingsApplicationContentFilterActions = ({
  activeFilters,
  selectableFilter,
  selectedSelectableValue,
  onFilterChange,
}: SettingsApplicationContentFilterActionsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

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
            onFilterChange({ filterKey: key, universalIdentifier: null })
          }
        />
      ))}
      {isDefined(selectableFilter) && (
        <SettingsApplicationContentFilterDropdown
          options={selectableFilter.options}
          selectedUniversalIdentifier={selectedSelectableValue}
          onChange={(universalIdentifier) =>
            onFilterChange({
              filterKey: selectableFilter.key,
              universalIdentifier,
            })
          }
        />
      )}
    </>
  );
};
