import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateRecordIndexTabField } from '@/object-record/record-index-tab/hooks/useUpdateRecordIndexTabField';
import { canDisplayRecordIndexTabsForFieldMetadataItem } from '@/object-record/record-index-tab/utils/canDisplayRecordIndexTabsForFieldMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronLeft } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const ViewPickerTabFieldContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const { setViewPickerMode } = useViewPickerMode();

  const { closeDropdown } = useCloseDropdown();

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
    setViewPickerMode('list');
    closeDropdown();
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setViewPickerMode('list')}
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
