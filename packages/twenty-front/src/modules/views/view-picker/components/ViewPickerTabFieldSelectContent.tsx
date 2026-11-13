import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { usePersistRecordIndexViewTabs } from '@/object-record/record-index-tab/hooks/usePersistRecordIndexViewTabs';
import { useUpdateRecordIndexTabField } from '@/object-record/record-index-tab/hooks/useUpdateRecordIndexTabField';
import { canDisplayRecordIndexTabsForFieldMetadataItem } from '@/object-record/record-index-tab/utils/canDisplayRecordIndexTabsForFieldMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useLingui } from '@lingui/react/macro';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconChevronLeft, IconFilter } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const ViewPickerTabFieldSelectContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const { setViewPickerMode } = useViewPickerMode();

  const { canPersistChanges } = useCanPersistViewChanges();

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const recordIndexTabs = useAtomComponentSelectorValue(
    recordIndexTabsComponentSelector,
  );

  const { updateRecordIndexTabField } =
    useUpdateRecordIndexTabField(recordIndexId);

  const { ensureAllViewTab } = usePersistRecordIndexViewTabs();

  const isCustomTabsSelected =
    !isDefined(recordIndexTabFieldMetadataItem) &&
    isNonEmptyArray(recordIndexTabs);

  const recordIndexTabFieldMetadataItems =
    objectMetadataItem.readableFields.filter(
      canDisplayRecordIndexTabsForFieldMetadataItem,
    );

  const handleRecordIndexTabFieldChange = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    setViewPickerMode('tab-field');

    if (fieldMetadataItem.id !== recordIndexTabFieldMetadataItem?.id) {
      await updateRecordIndexTabField(fieldMetadataItem);
    }
  };

  const handleCustomTabsSelect = async () => {
    setViewPickerMode('tab-field');

    if (isCustomTabsSelected) {
      return;
    }

    if (isDefined(recordIndexTabFieldMetadataItem)) {
      await updateRecordIndexTabField(undefined);
    }

    await ensureAllViewTab();
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setViewPickerMode('tab-field')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Tabs by`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
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
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <ListItemButton
          onClick={handleCustomTabsSelect}
          role="option"
          aria-selected={isCustomTabsSelected}
          selected={isCustomTabsSelected}
          indicator="check"
          disabled={!canPersistChanges}
          startIcon={<SelectOptionIcon Icon={IconFilter} />}
        >
          {t`Custom filters`}
        </ListItemButton>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
