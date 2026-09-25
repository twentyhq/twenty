import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { isFieldMetadataItemToggleMineFilterable } from '@/views/utils/isFieldMetadataItemToggleMineFilterable';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconX, useIcons } from 'twenty-ui/icon';

export const ObjectOptionsDropdownToggleMineFilterFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();

  const toggleMineFilterableFields = objectMetadataItem.fields.filter(
    (field) =>
      isFieldMetadataItemToggleMineFilterable(field) &&
      field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleToggleMineFilterFieldChange = async (
    fieldMetadataItem: FieldMetadataItem | null,
  ) => {
    await updateCurrentView({
      toggleMineFilterFieldMetadataId: fieldMetadataItem?.id ?? null,
    });
    closeDropdown();
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`All/Mine field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {toggleMineFilterableFields.map((fieldMetadataItem) => (
          <ListItem
            key={fieldMetadataItem.id}
            onClick={() => handleToggleMineFilterFieldChange(fieldMetadataItem)}
            role="option"
            aria-selected={
              fieldMetadataItem.id ===
              currentView?.toggleMineFilterFieldMetadataId
            }
            selected={
              fieldMetadataItem.id ===
              currentView?.toggleMineFilterFieldMetadataId
            }
            indicator="check"
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            {fieldMetadataItem.label}
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
      {isDefined(currentView?.toggleMineFilterFieldMetadataId) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <ListItem
              startIcon={<IconX />}
              onClick={() => handleToggleMineFilterFieldChange(null)}
            >{t`Remove All/Mine toggle`}</ListItem>
          </DropdownMenuItemsContainer>
        </>
      )}
    </LegacyDropdownContent>
  );
};
