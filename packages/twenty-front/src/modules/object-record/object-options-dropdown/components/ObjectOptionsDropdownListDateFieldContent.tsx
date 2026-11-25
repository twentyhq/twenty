import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexListDateFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexListDateFieldMetadataIdComponentState';
import { isFieldMetadataItemAvailableAsListDateField } from '@/object-record/record-list/utils/isFieldMetadataItemAvailableAsListDateField';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useLingui } from '@lingui/react/macro';
import { isNull } from '@sniptt/guards';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronLeft, IconCircleOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const ObjectOptionsDropdownListDateFieldContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { objectMetadataItem, onContentChange } = useObjectOptionsDropdown();

  const { updateCurrentView } = useUpdateCurrentView();

  const [
    recordIndexListDateFieldMetadataId,
    setRecordIndexListDateFieldMetadataId,
  ] = useAtomComponentState(recordIndexListDateFieldMetadataIdComponentState);

  const availableDateFieldMetadataItems =
    objectMetadataItem.readableFields.filter(
      isFieldMetadataItemAvailableAsListDateField,
    );

  const handleListDateFieldChange = async (
    listDateFieldMetadataId: string | null,
  ) => {
    setRecordIndexListDateFieldMetadataId(listDateFieldMetadataId);

    try {
      await updateCurrentView({ listDateFieldMetadataId });
    } catch (error) {
      setRecordIndexListDateFieldMetadataId(recordIndexListDateFieldMetadataId);
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
        {t`Date field`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <ListItemButton
          onClick={() => handleListDateFieldChange(null)}
          role="option"
          aria-selected={isNull(recordIndexListDateFieldMetadataId)}
          selected={isNull(recordIndexListDateFieldMetadataId)}
          indicator="check"
          startIcon={<IconCircleOff />}
        >
          {t`None`}
        </ListItemButton>
        {availableDateFieldMetadataItems.map((fieldMetadataItem) => (
          <ListItemButton
            key={fieldMetadataItem.id}
            onClick={() => handleListDateFieldChange(fieldMetadataItem.id)}
            role="option"
            aria-selected={
              fieldMetadataItem.id === recordIndexListDateFieldMetadataId
            }
            selected={
              fieldMetadataItem.id === recordIndexListDateFieldMetadataId
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
