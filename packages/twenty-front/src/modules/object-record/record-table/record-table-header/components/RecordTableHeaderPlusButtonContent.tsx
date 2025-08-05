import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { closeDropdown } = useCloseDropdown();

  const hiddenTableColumns = useRecoilComponentValue(
    hiddenTableColumnsComponentSelector,
  );

  const { getIcon } = useIcons();
  const { handleColumnVisibilityChange } = useTableColumns({
    objectMetadataId: objectMetadataItem.id,
  });

  const handleAddColumn = useCallback(
    (column: ColumnDefinition<FieldMetadata>) => {
      closeDropdown();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, closeDropdown],
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {hiddenTableColumns.map((column) => (
          <MenuItem
            key={column.fieldMetadataId}
            onClick={() => handleAddColumn(column)}
            LeftIcon={getIcon(column.iconName)}
            text={column.label}
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
