import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const { objectMetadataItem, recordTableId, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleAddColumn = useCallback(
    async (
      column: Pick<ColumnDefinition<FieldMetadata>, 'fieldMetadataId'>,
    ) => {
      closeDropdown();
      await changeRecordFieldVisibility({ ...column, isVisible: true });
    },
    [changeRecordFieldVisibility, closeDropdown],
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      !visibleRecordFields
        .map((recordField) => recordField.fieldMetadataItemId)
        .includes(fieldMetadataItemToFilter.id),
  );

  const handleFieldMetadataItemMenuItemClick = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    await handleAddColumn({
      fieldMetadataId: fieldMetadataItem.id,
    });
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {availableFieldMetadataItemsToShow.map((fieldMetadataItem) => (
          <MenuItem
            key={fieldMetadataItem.id}
            onClick={() =>
              handleFieldMetadataItemMenuItemClick(fieldMetadataItem)
            }
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <UndecoratedLink
          fullWidth
          to={getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
          })}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
          }}
        >
          <MenuItem LeftIcon={IconSettings} text={t`Customize fields`} />
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
