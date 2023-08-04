import React, { ComponentProps, useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconButtonGroup } from '@/ui/button/components/IconButtonGroup';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { IconPlus } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../types/ViewField';

const StyledColumnMenu = styled(DropdownMenu)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledIconButtonGroup = styled(IconButtonGroup)`
  display: none;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
`;
const styledIconButtonGroupClassName = 'column-menu-item-icon-button-group';

const StyledColumnMenuItem = styled(DropdownMenuItem)`
  position: relative;

  &:hover {
    .${styledIconButtonGroupClassName} {
      display: flex;
    }
  }
`;

type EntityTableColumnMenuProps = {
  onAddViewField: (
    viewFieldDefinition: ViewFieldDefinition<ViewFieldMetadata>,
  ) => void;
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
          <StyledColumnMenuItem key={viewFieldDefinition.id}>
            {viewFieldDefinition.columnIcon &&
              React.cloneElement(viewFieldDefinition.columnIcon, {
                size: theme.icon.size.md,
              })}
            {viewFieldDefinition.columnLabel}
            <StyledIconButtonGroup
              className={styledIconButtonGroupClassName}
              variant="transparent"
              size="small"
            >
              <IconButton
                icon={<IconPlus size={theme.icon.size.sm} />}
                onClick={() => onAddViewField(viewFieldDefinition)}
              />
            </StyledIconButtonGroup>
          </StyledColumnMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </StyledColumnMenu>
  );
};
