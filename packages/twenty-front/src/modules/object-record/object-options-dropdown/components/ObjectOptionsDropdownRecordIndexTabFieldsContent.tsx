import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useUpdateRecordIndexTabField } from '@/object-record/record-index-tab/hooks/useUpdateRecordIndexTabField';
import { canDisplayRecordIndexTabsForFieldMetadataItem } from '@/object-record/record-index-tab/utils/canDisplayRecordIndexTabsForFieldMetadataItem';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronLeft } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const ObjectOptionsDropdownRecordIndexTabFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { recordIndexId, objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();

  const { canPersistChanges } = useCanPersistViewChanges();

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const { updateRecordIndexTabField } =
    useUpdateRecordIndexTabField(recordIndexId);

  const recordIndexTabFieldMetadataItems =
    objectMetadataItem.readableFields.filter(
      canDisplayRecordIndexTabsForFieldMetadataItem,
    );

  const handleRecordIndexTabFieldChange = (
    fieldMetadataItem: FieldMetadataItem | undefined,
  ) => {
    updateRecordIndexTabField(fieldMetadataItem);
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
        {t`Tabs`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <ListItemButton
          onClick={() => handleRecordIndexTabFieldChange(undefined)}
          role="option"
          aria-selected={!isDefined(recordIndexTabFieldMetadataItem)}
          selected={!isDefined(recordIndexTabFieldMetadataItem)}
          indicator="check"
          disabled={!canPersistChanges}
        >{t`None`}</ListItemButton>
        {recordIndexTabFieldMetadataItems.map((fieldMetadataItem) => (
          <ListItemButton
            key={fieldMetadataItem.id}
            onClick={() => handleRecordIndexTabFieldChange(fieldMetadataItem)}
            role="option"
            aria-selected={
              fieldMetadataItem.id === recordIndexTabFieldMetadataItem?.id
            }
            selected={
              fieldMetadataItem.id === recordIndexTabFieldMetadataItem?.id
            }
            indicator="check"
            disabled={!canPersistChanges}
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
