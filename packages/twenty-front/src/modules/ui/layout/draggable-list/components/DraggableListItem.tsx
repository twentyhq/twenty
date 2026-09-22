import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconGripVertical, type IconComponent } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';

const StyledRow = styled.div`
  > [data-indicator] {
    cursor: default;
  }

  &[data-draggable] > [data-indicator] {
    cursor: grab;
  }

  &[data-placeholder] > [data-indicator] {
    color: ${themeCssVariables.font.color.tertiary};
  }

  .drag-grip {
    color: ${themeCssVariables.font.color.light};
  }

  &[data-drag-disabled] .drag-grip {
    color: ${themeCssVariables.font.color.extraLight};
  }

  &[data-icon-container] .drag-grip {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:hover .drag-default-icon,
  &:focus-within .drag-default-icon {
    opacity: 0;
  }

  &:hover .drag-hover-grip,
  &:focus-within .drag-hover-grip {
    opacity: 1;
  }
`;

const StyledIcons = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSwap = styled.span`
  display: inline-grid;

  > span {
    grid-area: 1 / 1;
    display: inline-flex;
  }

  .drag-hover-grip {
    opacity: 0;
  }
`;

type DraggableListItemProps = {
  children: ReactNode;
  icon?: IconComponent;
  iconContainer?: boolean;
  placeholder?: boolean;
  color?: 'neutral' | 'danger';
  actions?: ReactNode;
  actionsVisibility?: 'hover' | 'always';
  description?: ReactNode;
  onClick?: () => void;
  className?: string;
  grip?: 'never' | 'always' | 'onHover';
  dragDisabled?: boolean;
};

export const DraggableListItem = ({
  children,
  icon,
  iconContainer = false,
  placeholder = false,
  color = 'neutral',
  actions,
  actionsVisibility,
  description,
  onClick,
  className,
  grip = 'never',
  dragDisabled = false,
}: DraggableListItemProps) => {
  const hasStartIcon = isDefined(icon) || grip !== 'never';
  const isDraggable = grip !== 'never' && !dragDisabled;
  const container = iconContainer ? 'soft' : 'none';
  const gripIcon = (
    <span className="drag-grip">
      <ListItemIcon icon={IconGripVertical} container={container} />
    </span>
  );

  return (
    <StyledRow
      className={className}
      onClick={onClick}
      data-draggable={isDraggable || undefined}
      data-drag-disabled={dragDisabled || undefined}
      data-placeholder={placeholder || undefined}
      data-icon-container={iconContainer || undefined}
    >
      <ListItem
        color={color}
        actions={actions}
        actionsVisibility={actionsVisibility}
        description={description}
        startIcon={
          hasStartIcon ? (
            <StyledIcons>
              {grip === 'always' && gripIcon}
              {grip === 'onHover' ? (
                <StyledSwap>
                  <span className="drag-default-icon">
                    <ListItemIcon icon={icon} container={container} />
                  </span>
                  <span className="drag-hover-grip">{gripIcon}</span>
                </StyledSwap>
              ) : (
                <ListItemIcon icon={icon} container={container} />
              )}
            </StyledIcons>
          ) : undefined
        }
      >
        {children}
      </ListItem>
    </StyledRow>
  );
};
