import { cloneElement, ComponentProps, useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { IconPlus } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { hiddenTableColumnsState } from '../states/tableColumnsState';

const StyledColumnMenu = styled(DropdownMenu)`
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

  const hiddenColumns = useRecoilValue(hiddenTableColumnsState);

  useListenClickOutside({
    refs: [ref],
    callback: onClickOutside,
  });

  return (
    <StyledColumnMenu {...props} ref={ref}>
      <DropdownMenuItemsContainer>
        {hiddenColumns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            actions={[
              <IconButton
                icon={<IconPlus size={theme.icon.size.sm} />}
                onClick={() => onAddColumn(column.id)}
              />,
            ]}
          >
            {column.columnIcon &&
              cloneElement(column.columnIcon, {
                size: theme.icon.size.md,
              })}
            {column.columnLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
