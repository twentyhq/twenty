import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledActions = styled.div`
  align-items: center;
  bottom: ${themeCssVariables.spacing['0.5']};
  display: flex;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: ${themeCssVariables.spacing['0.5']};
`;

type NavigationMenuItemRowActionsProps = {
  rightOptions?: ReactNode;
  onOpenActions: () => void;
};

export const NavigationMenuItemRowActions = ({
  rightOptions,
  onOpenActions,
}: NavigationMenuItemRowActionsProps) => {
  const { t } = useLingui();

  return (
    <StyledActions
      data-navigation-actions
      onMouseDown={(event) => event.stopPropagation()}
    >
      {rightOptions}
      <LightIconButton
        size="sm"
        emphasis="subtle"
        aria-label={t`Menu item actions`}
        onClick={(event) => {
          event.stopPropagation();
          onOpenActions();
        }}
      >
        <IconDotsVertical />
      </LightIconButton>
    </StyledActions>
  );
};
