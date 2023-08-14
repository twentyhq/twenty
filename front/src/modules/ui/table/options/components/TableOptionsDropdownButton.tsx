import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import DropdownButton from '@/ui/filter-n-sort/components/DropdownButton';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import {
  IconChevronLeft,
  IconFileImport,
  IconMinus,
  IconPlus,
  IconTag,
} from '@/ui/icon';
import {
  hiddenTableColumnsState,
  tableColumnsState,
  visibleTableColumnsState,
} from '@/ui/table/states/tableColumnsState';

import { TableOptionsDropdownSection } from './TableOptionsDropdownSection';

type TableOptionsDropdownButtonProps = {
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
  HotkeyScope: FiltersHotkeyScope;
};

enum Option {
  Properties = 'Properties',
}

export const TableOptionsDropdownButton = ({
  onColumnsChange,
  HotkeyScope,
}: TableOptionsDropdownButtonProps) => {
  const theme = useTheme();

  const { openSpreadsheetImport } = useSpreadsheetImport();

  const [isUnfolded, setIsUnfolded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined,
  );

  const [columns, setColumns] = useRecoilState(tableColumnsState);
  const visibleColumns = useRecoilValue(visibleTableColumnsState);
  const hiddenColumns = useRecoilValue(hiddenTableColumnsState);

  function handleImport() {
    openSpreadsheetImport({
      onSubmit: (datam, file) => {
        console.log('datam', datam);
        console.log('file', file);
      },
      fields: [],
    });
  }

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, nextIsVisible: boolean) => {
      const nextColumns = columns.map((column) =>
        column.id === columnId
          ? { ...column, isVisible: nextIsVisible }
          : column,
      );

      setColumns(nextColumns);
      onColumnsChange?.(nextColumns);
    },
    [columns, onColumnsChange, setColumns],
  );

  const renderFieldActions = useCallback(
    (column: ViewFieldDefinition<ViewFieldMetadata>) =>
      // Do not allow hiding last visible column
      !column.isVisible || visibleColumns.length > 1 ? (
        <IconButton
          icon={
            column.isVisible ? (
              <IconMinus size={theme.icon.size.sm} />
            ) : (
              <IconPlus size={theme.icon.size.sm} />
            )
          }
          onClick={() =>
            handleColumnVisibilityChange(column.id, !column.isVisible)
          }
        />
      ) : undefined,
    [handleColumnVisibilityChange, theme.icon.size.sm, visibleColumns.length],
  );

  const resetSelectedOption = useCallback(() => {
    setSelectedOption(undefined);
  }, []);

  return (
    <DropdownButton
      label="Options"
      isActive={false}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={setIsUnfolded}
      HotkeyScope={HotkeyScope}
    >
      {!selectedOption && (
        <>
          <DropdownMenuHeader>View settings</DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <DropdownMenuItem
              onClick={() => setSelectedOption(Option.Properties)}
            >
              <IconTag size={theme.icon.size.md} />
              Properties
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImport}>
              <IconFileImport size={theme.icon.size.md} />
              Import
            </DropdownMenuItem>
          </DropdownMenuItemsContainer>
        </>
      )}
      {selectedOption === Option.Properties && (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={resetSelectedOption}
          >
            Properties
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <TableOptionsDropdownSection
            renderActions={renderFieldActions}
            title="Visible"
            columns={visibleColumns}
          />
          {hiddenColumns.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <TableOptionsDropdownSection
                renderActions={renderFieldActions}
                title="Hidden"
                columns={hiddenColumns}
              />
            </>
          )}
        </>
      )}
    </DropdownButton>
  );
};
