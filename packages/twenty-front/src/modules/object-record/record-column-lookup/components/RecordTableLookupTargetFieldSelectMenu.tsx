import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

type RecordTableLookupTargetFieldSelectMenuProps = {
  relationFieldMetadataItem: FieldMetadataItem;
  onSelect: (lookupTargetFieldMetadataItem: FieldMetadataItem) => void;
  children?: ReactNode;
};

export const RecordTableLookupTargetFieldSelectMenu = ({
  relationFieldMetadataItem,
  onSelect,
  children,
}: RecordTableLookupTargetFieldSelectMenuProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItems,
  });

  const filteredLookupTargetFieldMetadataItems = (
    isDefined(relationObjectMetadataItem)
      ? getLookupTargetFieldMetadataItems(relationObjectMetadataItem)
      : []
  ).filter(({ label }) =>
    label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <>
      <Dropdown.Back
        aria-label={t`${relationFieldMetadataItem.label}, back to fields`}
      >
        {relationFieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Search
        value={searchInput}
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
        onValueChange={setSearchInput}
      />
      <Dropdown.Separator />
      {children}
      <Dropdown.Section scrollable>
        {isNonEmptyArray(filteredLookupTargetFieldMetadataItems) ? (
          filteredLookupTargetFieldMetadataItems.map(
            (lookupTargetFieldMetadataItem) => (
              <Dropdown.ActionItem
                key={lookupTargetFieldMetadataItem.id}
                onClick={() => onSelect(lookupTargetFieldMetadataItem)}
                startIcon={
                  <SelectOptionIcon
                    Icon={getIcon(lookupTargetFieldMetadataItem.icon)}
                  />
                }
              >
                {lookupTargetFieldMetadataItem.label}
              </Dropdown.ActionItem>
            ),
          )
        ) : (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
    </>
  );
};
