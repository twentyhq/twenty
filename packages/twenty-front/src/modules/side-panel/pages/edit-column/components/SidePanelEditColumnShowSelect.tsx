import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SidePanelEditColumnShowSelectSubPage } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnShowSelectSubPage';
import { type SidePanelEditColumnShowSelectEntry } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnShowSelectEntry';
import { type SidePanelEditColumnSummaryShowOption } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnSummaryShowOption';
import { getSidePanelEditColumnShowSelectSearchResults } from '@/side-panel/pages/edit-column/utils/getSidePanelEditColumnShowSelectSearchResults';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { findById, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

type SidePanelEditColumnShowSelectProps = {
  dropdownId: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  summaryShowOptions: SidePanelEditColumnSummaryShowOption[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export const SidePanelEditColumnShowSelect = ({
  dropdownId,
  relationObjectMetadataItem,
  fieldMetadataItems,
  summaryShowOptions,
  value,
  onChange,
}: SidePanelEditColumnShowSelectProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInputValue, setSearchInputValue] = useState('');

  const relationEntry: SidePanelEditColumnShowSelectEntry = {
    id: relationObjectMetadataItem.id,
    label: relationObjectMetadataItem.labelPlural,
    icon: relationObjectMetadataItem.icon,
    value: null,
    summaryShowOptions: summaryShowOptions.filter(
      ({ relationTargetFieldMetadataId }) =>
        !isDefined(relationTargetFieldMetadataId),
    ),
  };

  const fieldEntries =
    fieldMetadataItems.map<SidePanelEditColumnShowSelectEntry>(
      (fieldMetadataItem) => ({
        id: fieldMetadataItem.id,
        label: fieldMetadataItem.label,
        icon: fieldMetadataItem.icon,
        value: fieldMetadataItem.id,
        summaryShowOptions: summaryShowOptions.filter(
          ({ relationTargetFieldMetadataId }) =>
            relationTargetFieldMetadataId === fieldMetadataItem.id,
        ),
      }),
    );

  const isSearching = isNonEmptyString(searchInputValue.trim());

  const searchResults = getSidePanelEditColumnShowSelectSearchResults({
    entries: [relationEntry, ...fieldEntries],
    searchQuery: searchInputValue,
  });

  const selectedSummaryShowOption = summaryShowOptions.find(
    (summaryShowOption) => summaryShowOption.value === value,
  );
  const selectedFieldEntry = fieldEntries.find(findById(value ?? ''));

  const selectedOption = isDefined(selectedSummaryShowOption)
    ? {
        Icon:
          selectedSummaryShowOption.Icon ??
          getIcon(relationObjectMetadataItem.icon),
        label: selectedSummaryShowOption.label,
        value: selectedSummaryShowOption.value,
      }
    : {
        Icon: getIcon(selectedFieldEntry?.icon ?? relationEntry.icon),
        label: selectedFieldEntry?.label ?? relationEntry.label,
        value,
      };

  const renderEntryRow = (entry: SidePanelEditColumnShowSelectEntry) => {
    const startIcon = <SelectOptionIcon Icon={getIcon(entry.icon)} />;

    return isNonEmptyArray(entry.summaryShowOptions) ? (
      <Dropdown.ActionItem key={entry.id} page={entry.id} startIcon={startIcon}>
        {entry.label}
      </Dropdown.ActionItem>
    ) : (
      <Dropdown.OptionItem
        key={entry.id}
        selected={entry.value === value}
        indicator="check"
        onSelect={() => onChange(entry.value)}
        startIcon={startIcon}
      >
        {entry.label}
      </Dropdown.OptionItem>
    );
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        <SelectControl selectedOption={selectedOption} />
      </Dropdown.Trigger>
      <DropdownContent align="start" width="var(--anchor-width)">
        <Dropdown.Page id="root">
          <Dropdown.Search
            value={searchInputValue}
            onValueChange={setSearchInputValue}
            placeholder={t`Search`}
            aria-label={t`Search`}
          />
          <Dropdown.Separator />
          {isSearching ? (
            <Dropdown.Section scrollable>
              {isNonEmptyArray(searchResults) ? (
                searchResults.map((searchResult) => (
                  <Dropdown.OptionItem
                    key={searchResult.key}
                    selected={searchResult.value === value}
                    indicator="check"
                    onSelect={() => onChange(searchResult.value)}
                    startIcon={
                      <SelectOptionIcon Icon={getIcon(searchResult.icon)} />
                    }
                    description={searchResult.parentLabel}
                    descriptionPlacement="end"
                  >
                    {searchResult.label}
                  </Dropdown.OptionItem>
                ))
              ) : (
                <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
              )}
            </Dropdown.Section>
          ) : (
            <>
              <Dropdown.Section scrollable={false}>
                {renderEntryRow(relationEntry)}
              </Dropdown.Section>
              {isNonEmptyArray(fieldEntries) && (
                <>
                  <Dropdown.Separator />
                  <Dropdown.Section scrollable>
                    {fieldEntries.map(renderEntryRow)}
                  </Dropdown.Section>
                </>
              )}
            </>
          )}
        </Dropdown.Page>
        {[relationEntry, ...fieldEntries]
          .filter((entry) => isNonEmptyArray(entry.summaryShowOptions))
          .map((entry) => (
            <SidePanelEditColumnShowSelectSubPage
              key={entry.id}
              entry={entry}
              value={value}
              onChange={onChange}
            />
          ))}
      </DropdownContent>
    </DropdownRoot>
  );
};
