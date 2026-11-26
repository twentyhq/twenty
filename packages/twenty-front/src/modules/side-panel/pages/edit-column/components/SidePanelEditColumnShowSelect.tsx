import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SidePanelEditColumnShowSelectEntry } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnShowSelectEntry';
import { type SidePanelEditColumnSummaryShowOption } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnSummaryShowOption';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

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

  const toEntry = (
    entry: Omit<SidePanelEditColumnShowSelectEntry, 'summaryShowOptions'>,
  ): SidePanelEditColumnShowSelectEntry => ({
    ...entry,
    summaryShowOptions: summaryShowOptions.filter(
      ({ relationTargetFieldMetadataId }) =>
        relationTargetFieldMetadataId === entry.value,
    ),
  });

  const relationEntry = toEntry({
    id: relationObjectMetadataItem.id,
    label: relationObjectMetadataItem.labelPlural,
    icon: relationObjectMetadataItem.icon,
    value: null,
  });
  const fieldEntries = fieldMetadataItems.map(({ id, label, icon }) =>
    toEntry({ id, label, icon, value: id }),
  );
  const entries = [relationEntry, ...fieldEntries];

  // Summary options sit under the entry they aggregate, so they share its icon
  const options = entries.flatMap((entry) => [
    {
      key: entry.id,
      label: entry.label,
      icon: entry.icon,
      value: entry.value,
      parentLabel: undefined,
    },
    ...entry.summaryShowOptions.map((summaryShowOption) => ({
      key: summaryShowOption.value,
      label: summaryShowOption.label,
      icon: entry.icon,
      value: summaryShowOption.value,
      parentLabel: entry.label,
    })),
  ]);

  const selectedOption =
    options.find((option) => option.value === value) ?? relationEntry;

  const isRelationEntryTheOnlyChoice =
    !isNonEmptyArray(fieldEntries) &&
    isNonEmptyArray(relationEntry.summaryShowOptions);

  const renderOptionItem = ({
    key,
    label,
    value: optionValue,
    startIcon,
    description,
  }: {
    key: string;
    label: string;
    value: string | null;
    startIcon?: ReactNode;
    description?: string;
  }) => (
    <Dropdown.OptionItem
      key={key}
      selected={optionValue === value}
      indicator="check"
      onSelect={() => onChange(optionValue)}
      startIcon={startIcon}
      description={description}
      descriptionPlacement="end"
    >
      {label}
    </Dropdown.OptionItem>
  );

  const renderEntryRow = (entry: SidePanelEditColumnShowSelectEntry) => {
    const startIcon = <SelectOptionIcon Icon={getIcon(entry.icon)} />;

    return isNonEmptyArray(entry.summaryShowOptions) ? (
      <Dropdown.ActionItem key={entry.id} page={entry.id} startIcon={startIcon}>
        {entry.label}
      </Dropdown.ActionItem>
    ) : (
      renderOptionItem({ ...entry, key: entry.id, startIcon })
    );
  };

  const searchResults = filterBySearchQuery({
    items: options,
    searchQuery: searchInputValue.trim(),
    getSearchableValues: ({ label }) => [label],
  });

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      defaultPage={isRelationEntryTheOnlyChoice ? relationEntry.id : 'root'}
      onOpenChange={(open) => {
        if (open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        <SelectControl
          selectedOption={{
            Icon: getIcon(selectedOption.icon),
            label: selectedOption.label,
            value: selectedOption.value,
          }}
        />
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
          {isNonEmptyString(searchInputValue.trim()) ? (
            <Dropdown.Section scrollable>
              {isNonEmptyArray(searchResults) ? (
                searchResults.map((option) =>
                  renderOptionItem({
                    ...option,
                    startIcon: <SelectOptionIcon Icon={getIcon(option.icon)} />,
                    description: option.parentLabel,
                  }),
                )
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
        {entries
          .filter((entry) => isNonEmptyArray(entry.summaryShowOptions))
          .map((entry) => (
            <Dropdown.Page key={entry.id} id={entry.id}>
              {!isRelationEntryTheOnlyChoice && (
                <Dropdown.Back aria-label={t`${entry.label}, back`}>
                  {entry.label}
                </Dropdown.Back>
              )}
              <Dropdown.Section scrollable={false}>
                {renderOptionItem({
                  ...entry,
                  key: entry.id,
                  startIcon: <SelectOptionIcon Icon={getIcon(entry.icon)} />,
                })}
              </Dropdown.Section>
              <Dropdown.Separator />
              <Dropdown.Section scrollable={false}>
                {entry.summaryShowOptions.map((summaryShowOption) =>
                  renderOptionItem({
                    key: summaryShowOption.value,
                    label: summaryShowOption.operationLabel,
                    value: summaryShowOption.value,
                  }),
                )}
              </Dropdown.Section>
            </Dropdown.Page>
          ))}
      </DropdownContent>
    </DropdownRoot>
  );
};
