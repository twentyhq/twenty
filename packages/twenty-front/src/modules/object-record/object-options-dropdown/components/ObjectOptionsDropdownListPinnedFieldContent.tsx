import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexListPinnedFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexListPinnedFieldMetadataIdComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useLingui } from '@lingui/react/macro';
import { isNull } from '@sniptt/guards';
import { useState } from 'react';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronLeft, IconCircleOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const ObjectOptionsDropdownListPinnedFieldContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, onContentChange } = useObjectOptionsDropdown();

  const { updateCurrentView } = useUpdateCurrentView();

  const [
    recordIndexListPinnedFieldMetadataId,
    setRecordIndexListPinnedFieldMetadataId,
  ] = useAtomComponentState(recordIndexListPinnedFieldMetadataIdComponentState);

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const lowerCaseSearchInput = searchInput.toLowerCase();

  const fieldMetadataItemsMatchingSearch = getActiveFieldMetadataItems(
    objectMetadataItem,
  ).filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id &&
      fieldMetadataItem.label.toLowerCase().includes(lowerCaseSearchInput),
  );

  const noneLabel = t`None`;
  const isNoneMatchingSearch = noneLabel
    .toLowerCase()
    .includes(lowerCaseSearchInput);

  const handleListPinnedFieldChange = async (
    listPinnedFieldMetadataId: string | null,
  ) => {
    setRecordIndexListPinnedFieldMetadataId(listPinnedFieldMetadataId);

    try {
      await updateCurrentView({ listPinnedFieldMetadataId });
    } catch (error) {
      setRecordIndexListPinnedFieldMetadataId(
        recordIndexListPinnedFieldMetadataId,
      );
      throw error;
    }

    onContentChange('layout');
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('layout')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Pinned field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {isNoneMatchingSearch && (
          <ListItemButton
            onClick={() => handleListPinnedFieldChange(null)}
            role="option"
            aria-selected={isNull(recordIndexListPinnedFieldMetadataId)}
            selected={isNull(recordIndexListPinnedFieldMetadataId)}
            indicator="check"
            startIcon={<IconCircleOff />}
          >
            {noneLabel}
          </ListItemButton>
        )}
        {fieldMetadataItemsMatchingSearch.map((fieldMetadataItem) => (
          <ListItemButton
            key={fieldMetadataItem.id}
            onClick={() => handleListPinnedFieldChange(fieldMetadataItem.id)}
            role="option"
            aria-selected={
              fieldMetadataItem.id === recordIndexListPinnedFieldMetadataId
            }
            selected={
              fieldMetadataItem.id === recordIndexListPinnedFieldMetadataId
            }
            indicator="check"
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            {fieldMetadataItem.label}
          </ListItemButton>
        ))}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
