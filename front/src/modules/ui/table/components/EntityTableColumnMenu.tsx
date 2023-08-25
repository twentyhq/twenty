import { cloneElement, ComponentProps, useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconPlus } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';

const StyledColumnMenu = styled(StyledDropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type EntityTableColumnMenuProps = {
  onAddColumn: (columnId: string) => void;
  onClickOutside?: () => void;
} & ComponentProps<'div'>;

export const EntityTableColumnMenu = ({
  onAddColumn,
  onClickOutside = () => undefined,
  ...props
}: EntityTableColumnMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const hiddenColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  useListenClickOutside({
    refs: [ref],
    callback: onClickOutside,
  });

  return (
    <StyledColumnMenu {...props} ref={ref}>
      <StyledDropdownMenuItemsContainer>
        {hiddenColumns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            actions={
              <IconButton
                icon={<IconPlus size={theme.icon.size.sm} />}
                onClick={() => onAddColumn(column.id)}
              />
            }
          >
            {column.columnIcon &&
              cloneElement(column.columnIcon, {
                size: theme.icon.size.md,
              })}
            {column.columnLabel}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
