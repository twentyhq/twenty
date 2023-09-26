import { ComponentProps, useCallback, useRef } from 'react';
import styled from '@emotion/styled';

import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { ColumnDefinition } from '../types/ColumnDefinition';

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
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      onAddColumn?.();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, onAddColumn],
  );

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledColumnMenu {...props} ref={ref}>
      <StyledDropdownMenuItemsContainer>
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
      </StyledDropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
