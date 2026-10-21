import { buildConditionalDisplayContextRecordFilter } from '@/conditional-display/utils/buildConditionalDisplayContextRecordFilter';
import { getConditionalDisplayContextKeyIcon } from '@/conditional-display/utils/getConditionalDisplayContextKeyIcon';
import { getConditionalDisplayContextKeyLabel } from '@/conditional-display/utils/getConditionalDisplayContextKeyLabel';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useContext } from 'react';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type ConditionalDisplaySubjectSectionsProps = {
  recordFilterId: string;
  searchInput: string;
};

export const ConditionalDisplaySubjectSections = ({
  recordFilterId,
  searchInput,
}: ConditionalDisplaySubjectSectionsProps) => {
  const { t } = useLingui();

  const { availableContextKeys = [] } = useContext(AdvancedFilterContext);

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const contextKeysMatchingSearchInput = availableContextKeys.filter(
    (contextKey) =>
      getConditionalDisplayContextKeyLabel(contextKey)
        .toLocaleLowerCase()
        .includes(searchInput.toLocaleLowerCase()),
  );

  const sections = [
    {
      id: 'current-user',
      label: t`Current user`,
      contextKeys: contextKeysMatchingSearchInput.filter(
        (contextKey) => contextKey !== 'device',
      ),
    },
    {
      id: 'device',
      label: t`Device`,
      contextKeys: contextKeysMatchingSearchInput.filter(
        (contextKey) => contextKey === 'device',
      ),
    },
  ].filter((section) => isNonEmptyArray(section.contextKeys));

  const handleContextKeySelect = (contextKey: ConditionalDisplayContextKey) => {
    const existingRecordFilter = currentRecordFilters.find(
      (recordFilter) => recordFilter.id === recordFilterId,
    );

    const newRecordFilter = buildConditionalDisplayContextRecordFilter({
      id: recordFilterId,
      contextKey,
      recordFilterGroupId: existingRecordFilter?.recordFilterGroupId,
      positionInRecordFilterGroup:
        existingRecordFilter?.positionInRecordFilterGroup,
    });

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
    upsertRecordFilter(newRecordFilter);
    closeAdvancedFilterFieldSelectDropdown();
  };

  return (
    <>
      {sections.map((section) => (
        <Fragment key={section.id}>
          <Dropdown.Separator />
          <Dropdown.Section label={section.label}>
            {section.contextKeys.map((contextKey) => (
              <Dropdown.OptionItem
                key={contextKey}
                closeOnSelect={false}
                onSelect={() => handleContextKeySelect(contextKey)}
                startIcon={
                  <SelectOptionIcon
                    Icon={getConditionalDisplayContextKeyIcon(contextKey)}
                  />
                }
              >
                {getConditionalDisplayContextKeyLabel(contextKey)}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Fragment>
      ))}
    </>
  );
};
