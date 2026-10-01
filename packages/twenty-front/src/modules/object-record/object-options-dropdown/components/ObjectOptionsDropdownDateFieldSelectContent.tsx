import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useGetAvailableDateFields } from '@/views/view-picker/hooks/useGetAvailableDateFields';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

type ObjectOptionsDropdownDateFieldSelectContentProps = {
  title: string;
  selectableFields: FieldMetadataItem[];
  selectedFieldMetadataId: string | null | undefined;
  onBack: () => void;
  onSelect: (fieldMetadataId: string | null) => Promise<void>;
};

export const ObjectOptionsDropdownDateFieldSelectContent = ({
  title,
  selectableFields,
  selectedFieldMetadataId,
  onBack,
  onSelect,
}: ObjectOptionsDropdownDateFieldSelectContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { closeDropdown } = useObjectOptionsDropdown();
  const { navigateToDateFieldSettings } = useGetAvailableDateFields();

  const filteredFields = selectableFields.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleSelect = async (fieldMetadataId: string | null) => {
    await onSelect(fieldMetadataId);
    closeDropdown();
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {title}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {filteredFields.map((fieldMetadataItem) => (
          <ListItem
            key={fieldMetadataItem.id}
            onClick={() => handleSelect(fieldMetadataItem.id)}
            role="option"
            aria-selected={fieldMetadataItem.id === selectedFieldMetadataId}
            selected={fieldMetadataItem.id === selectedFieldMetadataId}
            indicator="check"
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            {fieldMetadataItem.label}
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <ListItem
          startIcon={<IconSettings />}
          onClick={() => {
            navigateToDateFieldSettings();
            closeDropdown();
          }}
        >{t`Create date field`}</ListItem>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
