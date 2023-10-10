import { ComponentProps, useCallback, useRef } from 'react';
import styled from '@emotion/styled';

import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { ColumnDefinition } from '../types/ColumnDefinition';

const StyledHeaderPlusButton = styled(StyledDropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type DataTableHeaderPlusButtonProps = {
  onAddColumn?: () => void;
  onClickOutside?: () => void;
} & ComponentProps<'div'>;

export const DataTableHeaderPlusButton = ({
  onAddColumn,
  onClickOutside = () => undefined,
  ...props
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
    // eslint-disable-next-line twenty/no-spread-props
    <StyledHeaderPlusButton {...props} ref={ref}>
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
