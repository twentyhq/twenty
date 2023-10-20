import { ComponentProps, useCallback, useRef } from 'react';
import styled from '@emotion/styled';

import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { IconPlus } from '@/ui/display/icon';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { ColumnDefinition } from '../types/ColumnDefinition';

const StyledHeaderPlusButton = styled(DropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type DataTableHeaderPlusButtonProps = {
  onAddColumn?: () => void;
  onClickOutside?: () => void;
} & ComponentProps<'div'>;

export const DataTableHeaderPlusButton = ({
  onAddColumn,
  onClickOutside = () => undefined,
}: DataTableHeaderPlusButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  useListenClickOutside({
    refs: [ref],
    callback: onClickOutside,
  });

  const { handleColumnVisibilityChange } = useTableColumns();

  const handleAddColumn = useCallback(
    (column: ColumnDefinition<FieldMetadata>) => {
      onAddColumn?.();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, onAddColumn],
  );

  return (
    <StyledHeaderPlusButton ref={ref}>
      <DropdownMenuItemsContainer>
        {hiddenTableColumns.map((column) => (
          <MenuItem
            key={column.key}
            iconButtons={[
              {
                Icon: IconPlus,
                onClick: () => handleAddColumn(column),
              },
            ]}
            LeftIcon={column.Icon}
            text={column.name}
          />
        ))}
      </DropdownMenuItemsContainer>
    </StyledHeaderPlusButton>
  );
};
