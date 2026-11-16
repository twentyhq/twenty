import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  Dropdown,
  type DropdownActionItemProps,
} from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

type RecordTableRelationTargetFieldSelectMenuProps = {
  pageId: string;
  relationFieldMetadataItem: FieldMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  getFieldItemProps: (
    fieldMetadataItem: FieldMetadataItem,
  ) => Pick<DropdownActionItemProps, 'onClick' | 'page'>;
  children?: ReactNode;
};

export const RecordTableRelationTargetFieldSelectMenu = ({
  pageId,
  relationFieldMetadataItem,
  fieldMetadataItems,
  getFieldItemProps,
  children,
}: RecordTableRelationTargetFieldSelectMenuProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const filteredFieldMetadataItems = fieldMetadataItems.filter(({ label }) =>
    label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <Dropdown.Page id={pageId}>
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
        {isNonEmptyArray(filteredFieldMetadataItems) ? (
          filteredFieldMetadataItems.map((fieldMetadataItem) => {
            const { onClick, page } = getFieldItemProps(fieldMetadataItem);

            return (
              <Dropdown.ActionItem
                key={fieldMetadataItem.id}
                onClick={onClick}
                page={page}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                }
              >
                {fieldMetadataItem.label}
              </Dropdown.ActionItem>
            );
          })
        ) : (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
    </Dropdown.Page>
  );
};
