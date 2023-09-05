import { type ComponentProps, useCallback, useRef } from 'react';
import styled from '@emotion/styled';

import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import type { ColumnDefinition } from '../types/ColumnDefinition';

const StyledColumnMenu = styled(StyledDropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type EntityTableColumnMenuProps = {
  onAddColumn?: () => void;
  onClickOutside?: () => void;
} & ComponentProps<'div'>;

export const EntityTableColumnMenu = ({
  onAddColumn,
  onClickOutside = () => undefined,
  ...props
}: EntityTableColumnMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const hiddenColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  useListenClickOutside({
    refs: [ref],
    callback: onClickOutside,
  });

  const { handleColumnVisibilityChange } = useTableColumns();

  const handleAddColumn = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      onAddColumn?.();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, onAddColumn],
  );

  return (
    <StyledColumnMenu {...props} ref={ref}>
      <StyledDropdownMenuItemsContainer>
        {hiddenColumns.map((column) => (
          <MenuItem
            key={column.id}
            iconButtons={[
              {
                Icon: IconPlus,
                onClick: () => handleAddColumn(column),
              },
            ]}
            LeftIcon={column.icon}
            text={column.label}
          />
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
