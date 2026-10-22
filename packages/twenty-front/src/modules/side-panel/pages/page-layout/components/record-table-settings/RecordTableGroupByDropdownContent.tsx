import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const NO_GROUP_BY_ITEM_ID = 'no-group-by';

type RecordTableGroupByDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentMainGroupByFieldMetadataId: string | null;
  isClearable?: boolean;
};

export const RecordTableGroupByDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentMainGroupByFieldMetadataId,
  isClearable = true,
}: RecordTableGroupByDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const { handleGroupByFieldChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const groupableFields = (objectMetadataItem?.readableFields ?? []).filter(
    isFieldMetadataItemAvailableAsWidgetGroupByField,
  );

  const filteredFields = filterBySearchQuery({
    items: groupableFields,
    searchQuery,
    getSearchableValues: (fieldMetadataItem) => [fieldMetadataItem.label],
  });

  const shouldShowClearOption =
    isClearable &&
    isNonEmptyArray(
      filterBySearchQuery({
        items: [t`None`],
        searchQuery,
        getSearchableValues: (label) => [label],
      }),
    );

  return (
    <>
      <Dropdown.Search
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <ChartSettingsDropdownSection>
        <Dropdown.SelectionGroup
          aria-label={t`Group by`}
          value={currentMainGroupByFieldMetadataId ?? NO_GROUP_BY_ITEM_ID}
        >
          {shouldShowClearOption && (
            <Dropdown.OptionItem
              value={NO_GROUP_BY_ITEM_ID}
              onSelect={() => handleGroupByFieldChange(null)}
            >{t`None`}</Dropdown.OptionItem>
          )}
          {filteredFields.map((fieldMetadataItem) => (
            <Dropdown.OptionItem
              key={fieldMetadataItem.id}
              value={fieldMetadataItem.id}
              onSelect={() => handleGroupByFieldChange(fieldMetadataItem)}
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
            >
              {fieldMetadataItem.label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
        {!shouldShowClearOption && !isNonEmptyArray(filteredFields) && (
          <Dropdown.Empty>{t`No results found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
