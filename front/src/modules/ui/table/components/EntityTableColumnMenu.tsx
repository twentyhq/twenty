import { cloneElement, ComponentProps, useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { IconPlus } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledColumnMenu = styled(DropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type EntityTableColumnMenuProps = {
  onAddViewField: (viewFieldId: string) => void;
  onClickOutside?: () => void;
  viewFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
} & ComponentProps<'div'>;

export const EntityTableColumnMenu = ({
  onAddViewField,
  onClickOutside = () => undefined,
  viewFieldDefinitions,
  ...props
}: EntityTableColumnMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useListenClickOutside({
    refs: [ref],
    callback: onClickOutside,
  });

  return (
    <StyledColumnMenu {...props} ref={ref}>
      <DropdownMenuItemsContainer>
        {viewFieldDefinitions.map((viewFieldDefinition) => (
          <DropdownMenuItem
            key={viewFieldDefinition.id}
            actions={
              <IconButton
                icon={<IconPlus size={theme.icon.size.sm} />}
                onClick={() => onAddViewField(viewFieldDefinition.id)}
              />
            }
          >
            {viewFieldDefinition.columnIcon &&
              cloneElement(viewFieldDefinition.columnIcon, {
                size: theme.icon.size.md,
              })}
            {viewFieldDefinition.columnLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
